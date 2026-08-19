import useIsOperatorApproved from '@/hooks/contracts/approved-operator-registry/useIsOperatorApproved'

export default function OperatorApprovalBanner() {
    const { isWhitelisted, isLoading } = useIsOperatorApproved()
    if (isLoading || isWhitelisted) return null

    return (
        <div
            role='alert'
            className='w-full bg-destructive text-destructive-foreground text-sm py-2 px-4 text-center'
        >
            <strong className='mr-2'>Entries disabled:</strong>
            this operator is not approved in the ApprovedOperatorRegistry.
            Contact the operator to resolve.
        </div>
    )
}
