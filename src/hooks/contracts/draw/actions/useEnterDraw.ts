import { useChainId } from 'wagmi'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { lgoAbi } from '@/abi/lgoAbi'
import useTrackedContractWrite from '@/hooks/web3/useTrackedContractWrite'
import useIsLGOWhitelisted from '@/hooks/contracts/compliance-registry/useIsLGOWhitelisted'
import useIsPlayerActive from '@/hooks/contracts/player-registry/useIsPlayerActive'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useLGORead from '@/hooks/contracts/read/useLGORead'
import { useSelectedGame } from '@/providers/SelectedGameProvider'
import usePlayerActivityState, { PlayerTier } from '@/hooks/player-summary/usePlayerActivityState'
import { evaluatePretxDeposit } from '@/hooks/player/usePretxDeposit'
import { recordEntryCadence } from '@/providers/SessionSignalProvider'
import { ZERO_ADDRESS } from '@/web3/constants'

export type EnterDrawParams = {
    roundIndex: number
    amount: number
    payoutInWeth: boolean
    useWeth: boolean
    /**
     * Optional referral code for an unbound wallet's attributed entry (BLO-646). Routed via
     * the LGO's 5-arg overloads only when a ReferralManager is configured on this chain;
     * otherwise the legacy 4-arg signatures are used and the code is dropped (fail-soft).
     */
    referralCode?: string
}

export default function useEnterDraw() {
    const chainId = useChainId()
    const account = useAccountAddress()
    const navigate = useNavigate()
    const { gameContractName } = useSelectedGame()
    const lgoAddress = getContractAddress(chainId, ContractName.LGO)
    const lotteryAddress = getContractAddress(chainId, gameContractName)
    const lgo = useLGORead().read
    const { isWhitelisted } = useIsLGOWhitelisted()
    const { isActive } = useIsPlayerActive(account)
    const { state } = usePlayerActivityState()

    const enterWrite = useTrackedContractWrite({
        address: lgoAddress,
        abi: lgoAbi,
        functionName: 'enter',
    })

    const enterWethWrite = useTrackedContractWrite({
        address: lgoAddress,
        abi: lgoAbi,
        functionName: 'enterWeth',
    })

    const referralManagerAddress = getContractAddress(chainId, ContractName.REFERRAL_MANAGER)

    const enter = async (params: EnterDrawParams) => {
        const { roundIndex, amount, payoutInWeth, useWeth, referralCode } = params
        // The 5-arg attributed overload is used only when a manager exists to receive the fee
        // routing; viem resolves the LGO `enter`/`enterWeth` overloads by argument arity.
        const attributed = Boolean(referralCode) && referralManagerAddress !== ZERO_ADDRESS

        if (!isWhitelisted) {
            console.error('[useEnterDraw] LGO not whitelisted in ComplianceRegistry; refusing to enter.')
            return false
        }
        if (!isActive) {
            console.error('[useEnterDraw] Player not registered in PlayerRegistry; refusing to enter.')
            return false
        }

        // ETH path needs `total` (PEA + CF + OF) quoted by the LGO. WETH path
        // transfers `total` via transferFrom, but the pretx check wants the
        // same figure either way — compute it up front.
        const [total] = await lgo.entryQuote([lotteryAddress, amount])

        const decision = await evaluatePretxDeposit({
            chainId,
            walletAddress: account,
            amountWei: total,
        })

        if (decision && !decision.allow && decision.requiredAction === 'KYC_UPGRADE') {
            // Entry feeds the inflow cap — direct the player at the tier above
            // their gate-qualified one so the gate set they verify into is the
            // one that raises the cap. Falls back to T1 when no policy / state
            // is loaded.
            const targetTier: PlayerTier = state?.nextTier?.tier ?? 'T1'
            void navigate({ to: '/verify', search: { tier: targetTier } })
            return false
        }

        if (decision && !decision.allow) {
            console.error(`[useEnterDraw] pre-tx gate rejected entry: ${decision.requiredAction} (${decision.reason})`)
            return false
        }

        // Record the cadence timestamp for the Sybil correlator (task 26).
        // Captured before the wallet prompt so the array reflects the user's
        // intent timing, not the wallet UX delay.
        recordEntryCadence()

        const label = `Purchasing ${amount} ${amount === 1 ? 'entry' : 'entries'}`

        try {
            if (useWeth) {
                // WETH path: LGO pulls `total` WETH via transferFrom then unwraps;
                // no msg.value. Allowance must be pre-approved against the LGO address.
                if (attributed && referralCode) {
                    await enterWethWrite.writeAsync(
                        [lotteryAddress, roundIndex, amount, payoutInWeth, referralCode],
                        label,
                    )
                } else {
                    await enterWethWrite.writeAsync(
                        [lotteryAddress, roundIndex, amount, payoutInWeth],
                        label,
                    )
                }
            } else {
                // ETH path: msg.value must equal LGO.entryQuote(lottery, amount).total.
                if (attributed && referralCode) {
                    await enterWrite.writeAsync(
                        [lotteryAddress, roundIndex, amount, payoutInWeth, referralCode],
                        label,
                        { value: total },
                    )
                } else {
                    await enterWrite.writeAsync(
                        [lotteryAddress, roundIndex, amount, payoutInWeth],
                        label,
                        { value: total },
                    )
                }
            }
            return true
        } catch (error: unknown) {
            // Fallback copy for on-chain reverts the off-chain pre-tx gate did not catch
            // (e.g. headroom shrinking between the gate check and inclusion).
            const message = error instanceof Error ? error.message : String(error)
            if (message.includes('EntryBlocked')) {
                toast.error('Entries are temporarily paused on your account. Please try again later.')
            } else if (message.includes('NotCompliant')) {
                toast.error('This entry would exceed your entry allowance. Verify your identity to raise it, or contact support for an MLRO override.')
            }
            return false
        }
    }

    return {
        enter,
        isLoading: enterWrite.isLoading || enterWethWrite.isLoading,
        isError: enterWrite.isError || enterWethWrite.isError,
        isSuccess: enterWrite.isSuccess || enterWethWrite.isSuccess,
        isIdle: enterWrite.isIdle || enterWethWrite.isIdle,
        status: enterWrite.status || enterWethWrite.status,
        isLGOWhitelisted: isWhitelisted,
        isPlayerActive: isActive,
    }
}
