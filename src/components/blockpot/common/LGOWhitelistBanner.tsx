import useIsLGOWhitelisted from '@/hooks/contracts/compliance-registry/useIsLGOWhitelisted'

export default function LGOWhitelistBanner() {
    const { isWhitelisted, isLoading } = useIsLGOWhitelisted()
    if (isLoading || isWhitelisted) return null

    return (
        <div
            role='alert'
            className='w-full bg-destructive text-destructive-foreground text-sm py-2 px-4 text-center'
        >
            <strong className='mr-2'>Entries disabled:</strong>
            this Licensed Gaming Operator is not whitelisted in the ComplianceRegistry.
            Contact the operator to resolve.
        </div>
    )
}
