import useIsOperatorApproved from '@/hooks/contracts/approved-operator-registry/useIsOperatorApproved'

export default function OperatorApprovalBanner() {
    const { isWhitelisted } = useIsOperatorApproved()
    // Only a confirmed `false` closes entries. `undefined` (loading or a
    // transient read error) must not flash a site-wide closure.
    if (isWhitelisted !== false) return null

    return (
        <div
            role='alert'
            className='w-full bg-destructive text-destructive-foreground text-sm py-2 px-4 text-center'
        >
            <strong className='mr-2'>Entries are closed:</strong>
            Blockpot isn&apos;t currently approved to run draws.
            We&apos;ll reopen as soon as it&apos;s resolved.
        </div>
    )
}
