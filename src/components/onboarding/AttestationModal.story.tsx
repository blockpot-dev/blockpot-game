import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import AttestationModal, { AttestationFormValue } from './AttestationModal'
import type { CurrentTos } from '@/hooks/tos/useCurrentTos'

const MOCK_TOS: CurrentTos = {
    versionHash: '0x' + '00'.repeat(32),
    versionLabel: 'v2026-04-22',
    bodyMarkdown: [
        '# Blockpot Terms and Conditions',
        '',
        'These are mock Terms and Conditions used for Storybook rendering.',
        '',
        '1. You must be of legal gambling age in your jurisdiction.',
        '2. Blockpot does not accept players from blocked jurisdictions.',
        '3. Entries are final — refunds are not available.',
        '4. Winnings above your tier cap are held as pending_cdd until KYC is complete.',
        '5. Use of the service is subject to the operator being whitelisted.',
        '',
        'Full production copy lives in internal/tos/versions/<date>.md and is hashed.',
    ].join('\n'),
    effectiveFrom: '2026-04-22T00:00:00Z',
}

const meta: Meta<typeof AttestationModal> = {
    component: AttestationModal,
    parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj<typeof AttestationModal>

function Harness(props: {
    initial?: Partial<AttestationFormValue>
    submitError?: string
    tosLoading?: boolean
    tosError?: string
}) {
    const [open, setOpen] = useState(true)
    const [last, setLast] = useState<AttestationFormValue | null>(null)
    return (
        <div className='min-h-[640px]'>
            {last && (
                <pre className='text-xs text-gray-400 p-2 mb-2'>{JSON.stringify(last, null, 2)}</pre>
            )}
            <AttestationModal
                open={open}
                onOpenChange={setOpen}
                tos={props.tosLoading ? undefined : MOCK_TOS}
                tosLoading={!!props.tosLoading}
                tosError={props.tosError}
                submitError={props.submitError}
                onConfirm={(value) => {
                    setLast(value)
                    setOpen(false)
                }}
                onCancel={() => setOpen(false)}
                defaultJurisdiction={props.initial?.jurisdiction}
            />
        </div>
    )
}

// Empty: modal just opened, nothing filled in yet.
export const Empty: Story = {
    render: () => <Harness />,
}

// Valid: a jurisdiction is pre-selected so the user only has to fill DOB and
// tick the attestation checkbox to submit successfully.
export const Valid: Story = {
    render: () => <Harness initial={{ jurisdiction: 'GB' }} />,
}

// UnderageError: simulates a server-side rejection message (e.g. the backend
// age floor kicked in after client-side passed) so the error surface renders.
export const UnderageError: Story = {
    render: () => (
        <Harness
            initial={{ jurisdiction: 'GB' }}
            submitError='Declared date of birth implies an age under 18'
        />
    ),
}

// RichTosMarkdown: a TOS body that exercises every markdown feature the
// Markdown primitive must render — multiple heading levels, paragraphs,
// nested lists, inline links, bold/italic emphasis, inline code. Use this
// story to catch regressions in <Markdown> styling without spinning up the
// full onboarding flow.
const RICH_TOS: CurrentTos = {
    versionHash: '0x' + 'aa'.repeat(32),
    versionLabel: 'v2026-04-27-rich',
    bodyMarkdown: [
        '# Blockpot Terms and Conditions',
        '',
        'Welcome to Blockpot. By continuing you agree to the terms set out below.',
        'These terms incorporate, by reference, the Privacy Policy at',
        '[blockpot.io/privacy](https://blockpot.io/privacy) and the Responsible',
        'Gaming Guidelines at [blockpot.io/responsible-gaming](https://blockpot.io/responsible-gaming).',
        '',
        '## 1. Eligibility',
        '',
        'You must be **at least 18 years old** and physically located in a',
        'jurisdiction where online gaming is legal. *Blocked jurisdictions* are',
        'listed in the country picker above and are surfaced as un-selectable.',
        '',
        '### 1.1 Identity verification',
        '',
        'Tier 0 play is open after attestation only. To withdraw above the Tier 0',
        'cap you must complete identity verification, which:',
        '',
        '- collects a government-issued ID via our partner Sumsub,',
        '- runs sanctions and PEP screening,',
        '- and is required before any KYC-gated payout clears.',
        '',
        '## 2. Entries',
        '',
        'Entries are final. The protocol contract is at',
        '[etherscan.io/address/0xDraw](https://etherscan.io/address/0xDraw)',
        'and accepts the `enter(roundIndex, amount, payoutInWeth, operator)`',
        'function only while a round is open.',
        '',
        '1. Each entry costs `0.001 ETH` (PEA) plus a 2% contributor fee.',
        '2. The licensed operator additionally collects a 5% operator fee.',
        '3. Refunds are not available; see Responsible Gaming above.',
    ].join('\n'),
    effectiveFrom: '2026-04-27T00:00:00Z',
}

export const RichTosMarkdown: Story = {
    render: () => {
        const [open, setOpen] = useState(true)
        return (
            <div className='min-h-[640px]'>
                <AttestationModal
                    open={open}
                    onOpenChange={setOpen}
                    tos={RICH_TOS}
                    tosLoading={false}
                    onConfirm={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                    defaultJurisdiction='GB'
                />
            </div>
        )
    },
}
