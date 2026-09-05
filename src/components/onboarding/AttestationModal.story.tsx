import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import AttestationModal, { AttestationFormValue } from './AttestationModal'
import type { CurrentTos } from '@/hooks/tos/useCurrentTos'

// Registration gate v2 (BLO-682). There is no country picker in any story here,
// and none should be added: eligibility is decided server-side on resolved
// country. The three refusal stories are what a refused visitor actually sees.

const MOCK_TOS: CurrentTos = {
    versionHash: '0x' + '00'.repeat(32),
    versionLabel: '2026-09-04',
    bodyMarkdown: [
        '# Blockpot Terms and Conditions',
        '',
        'These are mock Terms and Conditions used for Storybook rendering.',
        '',
        '1. You must be old enough to play where you are.',
        '2. Blockpot is not available everywhere. We decide from where you are, not what you tell us.',
        '3. Entries are final — refunds are not available.',
        '4. A prize above your current limit is held safely until verification completes.',
        '5. Use of the service is subject to the operator being whitelisted.',
        '',
        'Full production copy lives in internal/tos/versions/<date>.md and is hashed.',
    ].join('\n'),
    effectiveFrom: '2026-09-04T00:00:00Z',
}

const meta: Meta<typeof AttestationModal> = {
    component: AttestationModal,
    parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj<typeof AttestationModal>

function Harness(props: {
    submitError?: string
    tosLoading?: boolean
    tosError?: string
    refusal?: React.ComponentProps<typeof AttestationModal>['refusal']
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
                refusal={props.refusal}
                onConfirm={(value) => {
                    setLast(value)
                    setOpen(false)
                }}
                onCancel={() => setOpen(false)}
            />
        </div>
    )
}

// The whole form: three DOB selects, the terms body, the attestation checkbox,
// and the forward-disclosure line. Nothing else — and in particular no country
// field, which is the point of this task.
export const Default: Story = {
    render: () => <Harness />,
}

// A retryable server error. Distinct from the refusals below: the form stays on
// screen because resubmitting can succeed.
export const SubmitError: Story = {
    render: () => <Harness submitError='Registration failed. Please try again.' />,
}

export const TosLoading: Story = {
    render: () => <Harness tosLoading />,
}

export const TosLoadFailed: Story = {
    render: () => <Harness tosError='Could not load the Terms and Conditions.' />,
}

// ── The three registration-gate refusals ────────────────────────────────────
// Each replaces the form entirely: no field the visitor can change alters the
// server's answer, so leaving inputs on screen would invite a retry. Check each
// against the messaging guardrails: neutral, no resolved country echoed back,
// no explanation of which check fired beyond the copy, claim language never
// custody language.

export const RefusedJurisdiction: Story = {
    render: () => <Harness refusal='JURISDICTION_BLOCKED' />,
}

export const RefusedUnderage: Story = {
    render: () => <Harness refusal='UNDERAGE' />,
}

export const RefusedSanctions: Story = {
    render: () => <Harness refusal='SANCTIONS_REFUSAL' />,
}

// RichTosMarkdown: a TOS body that exercises every markdown feature the
// Markdown primitive must render — multiple heading levels, paragraphs,
// nested lists, inline links, bold/italic emphasis, inline code. Use this
// story to catch regressions in <Markdown> styling without spinning up the
// full onboarding flow.
const RICH_TOS: CurrentTos = {
    versionHash: '0x' + 'aa'.repeat(32),
    versionLabel: '2026-09-04-rich',
    bodyMarkdown: [
        '# Blockpot Terms and Conditions',
        '',
        'Welcome to Blockpot. By continuing you agree to the terms set out below.',
        'These terms incorporate, by reference, the Privacy Policy at',
        '[blockpot.com/privacy](https://blockpot.com/privacy) and the Responsible',
        'Play guidance at [blockpot.com/responsible-play](https://blockpot.com/responsible-play).',
        '',
        '## 1. Eligibility',
        '',
        'You must be **old enough to play** where you are, and in a place where',
        'Blockpot is available. *Where you are* is resolved from your connection;',
        'there is no country to choose, and telling us a different one is not an',
        'option the product offers.',
        '',
        '### 1.1 Identity verification',
        '',
        'Play is open after attestation alone. To claim a larger prize you must',
        'complete identity verification, which:',
        '',
        '- collects a government-issued ID via our partner Sumsub,',
        '- runs sanctions and PEP screening,',
        '- and is required before a gated prize is released.',
        '',
        '## 2. Entries',
        '',
        'Entries are final. The protocol contract is at',
        '[basescan.org/address/0xDraw](https://basescan.org/address/0xDraw)',
        'and accepts the `enter(roundIndex, amount, payoutInWeth, operator)`',
        'function only while a round is open.',
        '',
        '1. Each entry costs `0.001 ETH` (PEA) plus a 2% contributor fee.',
        '2. The operator additionally collects a 5% operator fee.',
        '3. Refunds are not available; see Responsible Play above.',
    ].join('\n'),
    effectiveFrom: '2026-09-04T00:00:00Z',
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
                />
            </div>
        )
    },
}
