import { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useNavigate } from '@tanstack/react-router'
import { Address } from 'viem'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import usePlayerActivityState from '@/hooks/player-summary/usePlayerActivityState'
import usePlayerBalances from '@/hooks/contracts/operator/usePlayerBalances'
import useLifetimeSnapshot from '@/hooks/contracts/operator/useLifetimeSnapshot'
import useIsCompliant from '@/hooks/contracts/kyc-registry/useIsCompliant'
import useEntryBlockedUntil from '@/hooks/contracts/kyc-registry/useEntryBlockedUntil'
import useClaimRequest from '@/hooks/claim/useClaimRequest'
import useClaimOperation from '@/hooks/claim/useClaimOperation'
import { ClaimDecision } from '@/hooks/claim/types'
import { ApiError } from '@/api/gamingServiceClient'
import { ZERO_ADDRESS } from '@/web3/constants'
import AccountDialogView from './AccountDialogView'

export type AccountDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
    const { isConnected } = useAccount()
    const navigate = useNavigate()
    const chainId = useChainId()
    const queryClient = useQueryClient()
    const address = useAccountAddress()
    const { blockedUntil } = useEntryBlockedUntil(address as `0x${string}`)

    const { state, isLoading: stateLoading } = usePlayerActivityState()
    const { eth, weth } = usePlayerBalances(address)
    const { snapshot } = useLifetimeSnapshot(address)
    const { isCompliant } = useIsCompliant(address)

    const enteredEurMinor = snapshot?.enteredEurMinor ?? 0n
    const wonEurMinor = snapshot?.wonEurMinor ?? 0n
    const profitEurMinor = wonEurMinor > enteredEurMinor ? wonEurMinor - enteredEurMinor : 0n

    const claimRequest = useClaimRequest()
    const [decision, setDecision] = useState<ClaimDecision | null>(null)
    const [operationId, setOperationId] = useState<string | null>(null)
    const opQuery = useClaimOperation(operationId)
    const [isClaiming, setIsClaiming] = useState(false)

    useEffect(() => {
        if (!open) {
            setDecision(null)
            setOperationId(null)
            setIsClaiming(false)
        }
    }, [open])

    if (!isConnected) return null

    const handleVerify = () => {
        onOpenChange(false)
        // /verify derives the verification step itself; the tier is never
        // passed through the URL so it can't leak into player-facing copy.
        void navigate({
            to: '/verify',
            search: { returnTo: '/play' },
        })
    }

    const submitClaim = async (amountWei: bigint, inWeth: boolean): Promise<ClaimDecision | null> => {
        if (address === ZERO_ADDRESS) return null
        try {
            return await claimRequest.mutateAsync({
                fromWallet: address as Address,
                toWallet: address as Address,
                amountWei,
                chainId,
                inWeth,
            })
        } catch (e) {
            // Never surface the raw ApiError message to the player.
            console.error('[claim] request failed', e instanceof ApiError ? e.message : e)
            toast.error('Claim didn\'t start', { description: 'We couldn\'t reach Blockpot. Check your connection and retry.' })
            return null
        }
    }

    const handleClaim = async () => {
        if (eth === 0n && weth === 0n) return
        setIsClaiming(true)
        setDecision(null)
        setOperationId(null)
        try {
            if (eth > 0n) {
                const ethResult = await submitClaim(eth, false)
                if (!ethResult) return
                if (!ethResult.allow) {
                    setDecision(ethResult)
                    return
                }
                if (weth > 0n) {
                    const wethResult = await submitClaim(weth, true)
                    if (!wethResult) return
                    if (!wethResult.allow) {
                        setDecision(wethResult)
                        return
                    }
                    if (wethResult.operationId) setOperationId(wethResult.operationId)
                } else if (ethResult.operationId) {
                    setOperationId(ethResult.operationId)
                }
            } else if (weth > 0n) {
                const wethResult = await submitClaim(weth, true)
                if (!wethResult) return
                if (!wethResult.allow) {
                    setDecision(wethResult)
                    return
                }
                if (wethResult.operationId) setOperationId(wethResult.operationId)
            }
            toast.success('Claim submitted', { description: 'You can leave this dialog — we will refresh when it confirms.' })
        } finally {
            setIsClaiming(false)
        }
    }

    const handleReleasePending = async () => {
        if (eth === 0n && weth === 0n) return
        await handleClaim()
    }

    return (
        <AccountDialogView
            open={open}
            onOpenChange={onOpenChange}
            state={state}
            stateLoading={stateLoading}
            onRetryState={() => { void queryClient.invalidateQueries() }}
            eth={eth}
            weth={weth}
            enteredEurMinor={enteredEurMinor}
            wonEurMinor={wonEurMinor}
            profitEurMinor={profitEurMinor}
            isCompliant={isCompliant}
            blockedUntil={blockedUntil}
            decision={decision}
            isClaiming={isClaiming}
            claimRequestPending={claimRequest.isPending}
            opStatus={opQuery.data?.status}
            opError={opQuery.data?.error}
            onClaim={() => { void handleClaim() }}
            onReleasePending={() => { void handleReleasePending() }}
            onVerify={handleVerify}
            onClearDecision={() => setDecision(null)}
        />
    )
}
