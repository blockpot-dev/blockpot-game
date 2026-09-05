import { useMemo, useState } from 'react'
import {
    AttestationCheckbox,
    Button,
    Combobox,
    Dialog,
    DialogContent,
    DialogTopSection,
    Markdown,
} from '@blockpot-dev/blockpot-design-system'
import { Loader2 } from 'lucide-react'
import VStack from '@/components/core/VStack/VStack'
import type { CurrentTos } from '@/hooks/tos/useCurrentTos'

// Tier 0 attestation modal. The surrounding onboarding flow runs this after the
// SIWE signature but before /v1/players/register, so the attestation row exists
// before the player is registered on-chain. Shape follows ConsentDialog but is
// open-coded here because the spec requires the forward-disclosure notice to
// render *below* the required checkbox, which ConsentDialog does not expose as
// a slot.
//
// THERE IS NO COUNTRY FIELD, AND ONE MUST NEVER BE ADDED (BLO-674 / BLO-682).
//
// This modal used to collect a declared country and gate on it client-side
// against a bundled blocklist. Registration gate v2 removed both. A declared
// country is trivially false as a control — anyone excluded picks a different
// entry from the list — but potent as evidence against us, because storing it
// documents that we knowingly accepted a resident of wherever they typed.
//
// Eligibility is now decided server-side in POST /v1/attestation on the country
// the server resolves from the request (BLO-678), which also runs the age check
// against that jurisdiction's threshold and screens the wallet for sanctions.
// The client cannot pre-empt any of it and must not try: a client-side gate
// would leak the blocklist into the bundle and still be trivially bypassed.
//
// The modal's only job on the eligibility axis is to render the three refusals
// the server can return, neutrally — never echoing back the resolved country or
// naming which check fired beyond what the copy says.

export type AttestationFormValue = {
    dob: string // ISO yyyy-mm-dd
    tosVersionHash: string
}

/**
 * The refusal codes POST /v1/attestation can return, each as HTTP 403.
 * Mirrors `internal/httpapi/errors.go`; the strings are the wire contract and
 * are matched exactly.
 */
export type AttestationRefusal = 'JURISDICTION_BLOCKED' | 'UNDERAGE' | 'SANCTIONS_REFUSAL'

// Player-facing refusal copy. Deliberately neutral and deliberately vague:
// the server never tells the client which country it resolved, and the client
// never speculates. Naming the resolved country would confirm to an evader
// exactly what to change; naming the sanctions screen would tip off a screened
// wallet. Each says what happened and what to do next, and stops there.
const REFUSAL_COPY: Record<AttestationRefusal, { title: string; body: string }> = {
    JURISDICTION_BLOCKED: {
        title: 'Not available where you are',
        body: 'Blockpot runs in some places and not others, and yours is one of the others for now. Nothing has been saved, and no account has been created.',
    },
    UNDERAGE: {
        title: 'You are not old enough to play',
        body: 'The minimum age where you are is higher than the date of birth you entered. Nothing has been saved, and no account has been created.',
    },
    SANCTIONS_REFUSAL: {
        title: 'We cannot open an account for this wallet',
        body: 'This wallet did not pass the checks we are required to run before opening an account. If you believe this is wrong, contact support@blockpot.com and quote the wallet address.',
    },
}

export type AttestationModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    tos: CurrentTos | undefined
    tosLoading: boolean
    tosError?: string
    /** Retry loading the terms after `tosError`. */
    onRetryTos?: () => void
    submitting?: boolean
    submitError?: string
    onConfirm: (value: AttestationFormValue) => void
    onCancel?: () => void
    /**
     * Set when the server refused registration. Replaces the whole form: there
     * is nothing the visitor can edit that would change the outcome, so leaving
     * inputs on screen would invite them to try.
     */
    refusal?: AttestationRefusal
}

const MONTHS = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
]

const MIN_AGE_YEARS = 18

function daysInMonth(year: number, month: number): number {
    if (!year || !month) return 31
    return new Date(year, month, 0).getDate()
}

function ageAtDate(dob: Date, now: Date): number {
    let years = now.getFullYear() - dob.getFullYear()
    const monthDiff = now.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        years -= 1
    }
    return years
}

function parseDob(day: string, month: string, year: string): Date | null {
    if (!day || !month || !year) return null
    const d = new Date(`${year}-${month}-${day}T00:00:00Z`)
    if (Number.isNaN(d.getTime())) return null
    if (d.getUTCFullYear() !== Number(year)) return null
    return d
}

export default function AttestationModal({
    open,
    onOpenChange,
    tos,
    tosLoading,
    tosError,
    onRetryTos,
    submitting = false,
    submitError,
    onConfirm,
    onCancel,
    refusal,
}: AttestationModalProps) {
    const currentYear = new Date().getFullYear()
    const years = useMemo(() => {
        const list: string[] = []
        for (let y = currentYear - 18; y >= currentYear - 100; y -= 1) list.push(String(y))
        return list
    }, [currentYear])

    const [day, setDay] = useState('')
    const [month, setMonth] = useState('')
    const [year, setYear] = useState('')
    const [attested, setAttested] = useState(false)
    const [attempted, setAttempted] = useState(false)

    const dob = parseDob(day, month, year)
    // UX pre-check only. MIN_AGE_YEARS is the floor across every jurisdiction we
    // serve; the binding check is the server's, against the threshold for the
    // country it resolves. A DOB that clears this can still come back UNDERAGE.
    const ageOk = dob ? ageAtDate(dob, new Date()) >= MIN_AGE_YEARS : false
    const formOk = ageOk && attested && !!tos

    const dobError =
        attempted && !dob
            ? 'Enter your date of birth'
            : attempted && dob && !ageOk
                ? `You must be at least ${MIN_AGE_YEARS} years old`
                : undefined
    const attestationError = attempted && !attested ? 'Required' : undefined

    const maxDay = dob ? dob.getUTCDate() : daysInMonth(Number(year) || 0, Number(month) || 0)
    const days = useMemo(() => {
        const n = daysInMonth(Number(year) || currentYear, Number(month) || 1)
        return Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0'))
    }, [year, month, currentYear])
    // normalise day when month/year shrinks (leap year, 30-day months)
    if (day && Number(day) > maxDay) {
        // defer to next render to avoid setState during render
        queueMicrotask(() => setDay(''))
    }

    const handleConfirm = () => {
        setAttempted(true)
        if (!formOk || !tos) return
        onConfirm({
            dob: `${year}-${month}-${day}`,
            tosVersionHash: tos.versionHash,
        })
    }

    const handleCancel = () => {
        onCancel?.()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-slot='attestation-modal'
                className='sm:max-w-xl'
                showCloseButton={false}
            >
                {refusal ? (
                    <RefusalView refusal={refusal} onClose={handleCancel} />
                ) : (
                    <>
                        <DialogTopSection title='Welcome to Blockpot' />
                        <div className='text-sm text-gray-300 font-body mb-4'>
                    Before you continue, confirm a few details and accept our Terms and Conditions.
                        </div>

                        <VStack className='gap-4 mb-4'>
                            <div>
                                <label className='text-xs uppercase text-gray-400 tracking-wide'>Date of birth</label>
                                <div className='grid grid-cols-3 gap-2 mt-1.5'>
                                    <Combobox
                                        value={day}
                                        onValueChange={setDay}
                                        options={days.map((d) => ({ value: d, label: d }))}
                                        placeholder='Day'
                                        searchPlaceholder='Type a day…'
                                        emptyMessage='No matching day'
                                    />
                                    <Combobox
                                        value={month}
                                        onValueChange={setMonth}
                                        options={MONTHS.map((m) => ({ value: m.value, label: m.label }))}
                                        placeholder='Month'
                                        searchPlaceholder='Type a month…'
                                        emptyMessage='No matching month'
                                    />
                                    <Combobox
                                        value={year}
                                        onValueChange={setYear}
                                        options={years.map((y) => ({ value: y, label: y }))}
                                        placeholder='Year'
                                        searchPlaceholder='Type a year…'
                                        emptyMessage='No matching year'
                                    />
                                </div>
                                {dobError && (
                                    <p role='alert' className='text-xs text-destructive mt-1.5'>{dobError}</p>
                                )}
                            </div>

                            <div>
                                <label className='text-xs uppercase text-gray-400 tracking-wide'>
                            Terms and Conditions {tos?.versionLabel ? `(${tos.versionLabel})` : ''}
                                </label>
                                <div className='mt-1.5 h-40 overflow-y-auto rounded-md border border-gray-700 bg-gray-950 p-3 text-xs text-gray-300 font-body'>
                                    {tosLoading && (
                                        <div className='flex items-center gap-2 text-gray-400'>
                                            <Loader2 className='size-4 animate-spin' />
                                            <span>Loading Terms and Conditions…</span>
                                        </div>
                                    )}
                                    {!tosLoading && tosError && (
                                        <div className='flex items-center gap-2'>
                                            <span role='alert' className='text-destructive'>{tosError}</span>
                                            {onRetryTos && (
                                                <button type='button' onClick={onRetryTos} className='underline underline-offset-2 text-foreground cursor-pointer'>
                                            Retry loading terms
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {!tosLoading && !tosError && tos && (
                                        <Markdown source={tos.bodyMarkdown} className='text-xs text-gray-300 font-body' />
                                    )}
                                </div>
                            </div>
                        </VStack>

                        <div className='mb-3'>
                            <AttestationCheckbox
                                checked={attested}
                                onCheckedChange={setAttested}
                                label='I confirm I am of legal gambling age in my jurisdiction and that my use of this platform is legal where I reside.'
                                error={attestationError}
                                required
                            />
                        </div>

                        {/* Forward disclosure required by the registration gate (BLO-674).
                    Says the two things the strategy requires and nothing more: that
                    identity verification arrives at larger claims, and that it
                    becomes mandatory later. It must not describe the tier ladder,
                    the caps, or where the player currently sits — Phase 1 hides all
                    of that from players. "Claims", never "withdrawals": the player
                    claims escrowed prizes from their own wallet and is never
                    custodied. */}
                        <p
                            data-testid='attestation-forward-disclosure'
                            className='text-xs text-gray-400 font-body mb-6 leading-relaxed'
                        >
                    Identity verification will be required for larger claims, and will become
                    mandatory for all accounts in a future licensed phase. We&apos;ll tell you
                    before that happens.
                        </p>

                        {submitError && (
                            <p role='alert' className='text-xs text-destructive mb-3'>{submitError}</p>
                        )}

                        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                            <Button variant='outline' size='default' onClick={handleCancel} disabled={submitting}>
                        CANCEL
                            </Button>
                            <Button size='default' onClick={handleConfirm} disabled={submitting || !tos}>
                                {submitting
                                    ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>SUBMITTING…</span></>
                                    : 'AGREE & CONTINUE'}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

// A refused visitor sees this instead of the form. There is deliberately no way
// back to the inputs: no field they can change alters the server's answer, and
// offering one would read as an invitation to retry with different details.
function RefusalView({ refusal, onClose }: { refusal: AttestationRefusal; onClose: () => void }) {
    const { title, body } = REFUSAL_COPY[refusal]
    return (
        <>
            {/* One alert region over the title and the body together, so a screen
                reader announces the whole refusal rather than a heading followed
                by an unattached paragraph. */}
            <div role='alert' data-slot='attestation-refusal' data-refusal={refusal}>
                <DialogTopSection title={title} />
                <div className='text-sm text-gray-300 font-body mb-6 leading-relaxed'>
                    {body}
                </div>
            </div>
            <div className='flex justify-end'>
                <Button variant='outline' size='default' onClick={onClose}>
                    CLOSE
                </Button>
            </div>
        </>
    )
}
