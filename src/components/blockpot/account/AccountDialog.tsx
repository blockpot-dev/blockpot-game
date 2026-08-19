import { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useNavigate } from '@tanstack/react-router'
import { Address } from 'viem'
import { toast } from 'sonner'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import usePlayerActivityState from '@/hooks/player-summary/usePlayerActivityState'
import usePrizePoolContext from '@/hooks/player-summary/usePrizePoolContext'
import { useBlockpotDraw } from '@/providers/BlockpotDrawProvider'
import usePlayerKyc from '@/hooks/player/usePlayerKyc'
import useActivePolicy from '@/hooks/contracts/kyc/useActivePolicy'
import usePlayerBalances from '@/hooks/contracts/lgo/usePlayerBalances'
import useLifetimeSnapshot from '@/hooks/contracts/lgo/useLifetimeSnapshot'
import useIsCompliant from '@/hooks/contracts/kyc-registry/useIsCompliant'
import useEntryBlockedUntil from '@/hooks/contracts/kyc-registry/useEntryBlockedUntil'
import usePlayerGates from '@/hooks/contracts/kyc-registry/usePlayerGates'
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
    const address = useAccountAddress()
    const { blockedUntil } = useEntryBlockedUntil(address as `0x${string}`)

    const { state } = usePlayerActivityState()
    const { draw } = useBlockpotDraw()
    const { context: prizePoolContext } = usePrizePoolContext({ enabled: open && !draw })
    const { status: kycStatus } = usePlayerKyc()
    const { policy } = useActivePolicy()
    const { eth, weth } = usePlayerBalances(address)
    const { snapshot } = useLifetimeSnapshot(address)
    const { isCompliant } = useIsCompliant(address)
    const { gates: onChainGates } = usePlayerGates(address as Address)

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
        // Verification always targets the tier above the player's current
        // gate-qualified tier; fall back to T1 when the policy isn't loaded
        // or the player already sits at the top.
        const targetTier = state?.nextTier?.tier ?? 'T1'
        void navigate({
            to: '/verify',
            search: { tier: targetTier, returnTo: '/play' },
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
            const msg = e instanceof ApiError ? e.message : 'Could not contact the claim service. Please retry.'
            toast.error(msg)
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
            draw={!!draw}
            prizePoolContext={prizePoolContext}
            kycGates={kycStatus?.gates}
            onChainGates={onChainGates}
            tiers={policy?.tiers ?? []}
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
