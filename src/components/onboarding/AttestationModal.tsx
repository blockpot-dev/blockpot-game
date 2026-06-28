import { useMemo, useState } from 'react'
import countries from 'i18n-iso-countries'
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
import { BLOCKED_COUNTRY_CODES, isBlockedCountry } from '@/constants/blocked-jurisdictions'
import type { CurrentTos } from '@/hooks/tos/useCurrentTos'

// Tier 0 attestation modal. The surrounding onboarding flow (task 17) runs this
// after the SIWE signature but before /v1/players/register so the attestation
// row exists before the player is registered on-chain. Shape follows ConsentDialog
// but is open-coded here because the spec requires the Phase 2 notice to render
// *below* the required checkbox, which ConsentDialog does not expose as a slot.

export type AttestationFormValue = {
    dob: string // ISO yyyy-mm-dd
    jurisdiction: string // ISO 3166-1 alpha-2
    tosVersionHash: string
}

export type AttestationModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    tos: CurrentTos | undefined
    tosLoading: boolean
    tosError?: string
    submitting?: boolean
    submitError?: string
    onConfirm: (value: AttestationFormValue) => void
    onCancel?: () => void
    defaultJurisdiction?: string
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

function useCountryOptions() {
    return useMemo(() => {
        const names = countries.getNames('en', { select: 'official' })
        return Object.entries(names)
            .map(([code, name]) => ({ code, name }))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [])
}

export default function AttestationModal({
    open,
    onOpenChange,
    tos,
    tosLoading,
    tosError,
    submitting = false,
    submitError,
    onConfirm,
    onCancel,
    defaultJurisdiction,
}: AttestationModalProps) {
    const currentYear = new Date().getFullYear()
    const years = useMemo(() => {
        const list: string[] = []
        for (let y = currentYear - 18; y >= currentYear - 100; y -= 1) list.push(String(y))
        return list
    }, [currentYear])

    const countryOptions = useCountryOptions()

    const [day, setDay] = useState('')
    const [month, setMonth] = useState('')
    const [year, setYear] = useState('')
    const [jurisdiction, setJurisdiction] = useState(defaultJurisdiction ?? '')
    const [attested, setAttested] = useState(false)
    const [attempted, setAttempted] = useState(false)

    const dob = parseDob(day, month, year)
    const ageOk = dob ? ageAtDate(dob, new Date()) >= MIN_AGE_YEARS : false
    const jurisdictionOk = !!jurisdiction && !isBlockedCountry(jurisdiction)
    const formOk = ageOk && jurisdictionOk && attested && !!tos

    const dobError =
        attempted && !dob
            ? 'Enter your date of birth'
            : attempted && dob && !ageOk
                ? `You must be at least ${MIN_AGE_YEARS} years old`
                : undefined
    const jurisdictionError =
        attempted && !jurisdiction
            ? 'Select your country of residence'
            : attempted && jurisdiction && isBlockedCountry(jurisdiction)
                ? 'Blockpot cannot accept players from this jurisdiction'
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
            jurisdiction,
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
                <DialogTopSection title='Welcome to Blockpot' />
                <div className='text-sm text-gray-300 font-body mb-4'>
                    Before you continue, confirm a few details and accept our Terms of Service.
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
                        <label className='text-xs uppercase text-gray-400 tracking-wide'>Country of residence</label>
                        <Combobox
                            value={jurisdiction}
                            onValueChange={setJurisdiction}
                            options={countryOptions.map((c) => ({
                                value: c.code,
                                label: c.name,
                                disabled: BLOCKED_COUNTRY_CODES.includes(c.code),
                                suffix: BLOCKED_COUNTRY_CODES.includes(c.code) ? '— not supported' : undefined,
                            }))}
                            placeholder='Select your country'
                            searchPlaceholder='Search countries…'
                            emptyMessage='No matching country'
                            triggerClassName='mt-1.5'
                        />
                        {jurisdictionError && (
                            <p role='alert' className='text-xs text-destructive mt-1.5'>{jurisdictionError}</p>
                        )}
                    </div>

                    <div>
                        <label className='text-xs uppercase text-gray-400 tracking-wide'>
                            Terms of Service {tos?.versionLabel ? `(${tos.versionLabel})` : ''}
                        </label>
                        <div className='mt-1.5 h-40 overflow-y-auto rounded-md border border-gray-700 bg-gray-950 p-3 text-xs text-gray-300 font-body'>
                            {tosLoading && (
                                <div className='flex items-center gap-2 text-gray-400'>
                                    <Loader2 className='size-4 animate-spin' />
                                    <span>Loading Terms of Service…</span>
                                </div>
                            )}
                            {!tosLoading && tosError && (
                                <span className='text-destructive'>{tosError}</span>
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

                <p className='text-xs text-gray-400 font-body mb-6 leading-relaxed'>
                    To continue using Blockpot after Phase 2 launch, you&apos;ll need to complete identity verification. We&apos;ll notify you in advance.
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
            </DialogContent>
        </Dialog>
    )
}
