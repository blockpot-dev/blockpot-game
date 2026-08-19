import { useAccount, useBalance, useChainId } from 'wagmi'
import { Address } from 'viem'
import useFormattedCurrencyValues from '../utilities/useFormattedCurrencyValues'
import { Dispatch, SetStateAction, useState } from 'react'
import { useDraw } from '@/providers/BlockpotProvider'
import { useSelectedGame } from '@/providers/SelectedGameProvider'
import useEnterDraw from '../contracts/draw/actions/useEnterDraw'
import useReferralBinding from '../referral/useReferralBinding'
import usePendingReferralCode from '../referral/usePendingReferralCode'
import useErc20WithAllowance from '../contracts/erc20/useErc20WithAllowance'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { formatEtherMaxDecimals } from '@/utilities/formatters'
import { EntryAmount } from '@/types/draw/entry'
import useNativeCurrency from '../web3/useNativeCurrency'
import { Amounts } from '@/types/draw/tokens'
import { transactionStatusToInterfaceStatus } from '@/types/ui/interface-status'
import { CF_BASIS_POINTS, BASIS_POINTS_DIVISOR, PEA_PER_ENTRY_WEI } from '@/constants/protocol'
import useEntryQuote from '../contracts/operator/useEntryQuote'
import useOperatorFeeBps from '../contracts/operator/useOperatorFeeBps'
import usePretxDepositPreview from '../player/usePretxDepositPreview'
import { PretxRequiredAction } from '../player/usePretxDeposit'
import useIsCompliant from '../contracts/kyc-registry/useIsCompliant'
import useEntryBlockedUntil from '../contracts/kyc-registry/useEntryBlockedUntil'
import usePlayerActivityState from '../player-summary/usePlayerActivityState'
import { useNativeCurrencyToUSDPrice } from '../contracts/chainlink/useNativeCurrencyToUSDPrice'
import { useEurToUSDPrice } from '../contracts/chainlink/useEurToUSDPrice'
import priceWeiEurMinor from '@/utilities/priceWeiEurMinor'
import { ZERO_ADDRESS } from '@/web3/constants'
import { deriveCoolOffStatus } from '@/components/responsible-gaming/coolOffStatus'

function pretxReasonCopy(action: PretxRequiredAction): string | undefined {
    switch (action) {
    case 'KYC_UPGRADE': return 'KYC tier upgrade required at this entry amount.'
    case 'SELF_EXCLUDED': return 'Your account is self-excluded from play.'
    case 'SANCTIONS_BLOCK': return 'Wallet is sanctioned — entries disabled.'
    // Neutral copy: never leak the Sybil clustering verdict to the user.
    case 'SYBIL_BLOCK': return 'We’re unable to process this transaction; our compliance team will review.'
    case 'GEO_BLOCK': return 'Entries are not available in your region.'
    case 'LIMIT_EXCEEDED': return 'Your loss limit would be exceeded.'
    case 'HEADROOM_EXCEEDED': return 'This entry would exceed your entry allowance. Verify to keep playing.'
    case 'ENTRY_BLOCKED': return 'Entries are temporarily paused on your account. Please try again later.'
    case 'SEQUENCER_DOWN': return 'Base sequencer is down — try again later.'
    case 'NONE': return undefined
    }
}

function useAmounts(wei: bigint, nativeToken: string): Amounts {
    const fiat = useFormattedCurrencyValues(wei, { maxDecimalsNative: 6, maxDecimalsFiat: 4})
    return {
        amount: fiat.nativeValue,
        amountFormatted: fiat.nativeFormatted,
        fiat: fiat.fiatValue,
        fiatFormatted: fiat.fiatFormatted,
        nativeToken,
    }
}

export type EnterWETHConfig = {
    useWETH: boolean;
    setUseWETH: Dispatch<SetStateAction<boolean>>;
    needsApproval: boolean;
}

export type PayoutInWETHConfig = {
    payoutInWETH: boolean;
    setPayoutInWETH: Dispatch<SetStateAction<boolean>>;
}

export function useEntryForm() {
    const chainId = useChainId()
    const [entries, setEntries] = useState<EntryAmount>({ type: 'fixed', amount: 1 })
    const draw = useDraw()
    const { selectedGame } = useSelectedGame()
    const nativeToken = useNativeCurrency()

    const { address } = useAccount()
    const { data: balance } = useBalance({ address })

    const enterDrawAction = useEnterDraw()
    const referralBinding = useReferralBinding()
    const pendingReferral = usePendingReferralCode()
    const [useWETH, setUseWETH] = useState(false)
    const [payoutInWETH, setPayoutInWETH] = useState(false)
    // Allowance target is the operator - it pulls WETH via transferFrom and unwraps.
    const weth = useErc20WithAllowance(ContractName.WETH, getContractAddress(chainId, ContractName.OPERATOR))

    let entriesRawValue: bigint
    try {
        entriesRawValue = BigInt(entries.amount)
    } catch {
        entriesRawValue = 0n
    }

    const { quote } = useEntryQuote(entriesRawValue)
    const { operatorFeeBps } = useOperatorFeeBps()
    const { decision: pretxDecision } = usePretxDepositPreview(quote.total)
    const { isCompliant } = useIsCompliant((address ?? ZERO_ADDRESS) as Address)
    const { blockedUntil, isBlocked: entryBlocked } = useEntryBlockedUntil((address ?? ZERO_ADDRESS) as Address)
    const { state: activityState } = usePlayerActivityState()
    const ethUsd = useNativeCurrencyToUSDPrice()
    const eurUsd = useEurToUSDPrice()

    const peaAmounts = useAmounts(quote.pea, nativeToken)
    const cfAmounts = useAmounts(quote.cf, nativeToken)
    const ofAmounts = useAmounts(quote.opFee, nativeToken)
    const totalAmounts = useAmounts(quote.total, nativeToken)
    const amountPerEntry = useAmounts(PEA_PER_ENTRY_WEI, nativeToken)

    // Entry total is now a single atomic payment — either all ETH or all WETH.
    const needsAllowanceApproval = useWETH && quote.total > weth.allowance
    const nativeBalance = balance?.value ?? 0n

    const pretxBlocked = pretxDecision !== null && !pretxDecision.allow
    const pretxReason = pretxBlocked ? pretxReasonCopy(pretxDecision.requiredAction) : undefined
    const lossLimitBreached = pretxBlocked && pretxDecision.requiredAction === 'LIMIT_EXCEEDED'
    const complianceReason = address && !isCompliant
        ? 'Complete your KYC profile to enter this draw.'
        : undefined

    // After task 94 the entry path is hard-gated on-chain again:
    // the operator.enter/enterWeth revert EntryBlocked while entryBlockedUntil is in
    // the future and NotCompliant when entered + entry would exceed the tier's
    // inflow cap. Mirror both client-side so the button disables with an
    // explanation instead of letting the wallet surface a revert.
    const entryBlockedReason = address && entryBlocked
        ? `Entries are temporarily paused on your account. Entries reopen ${
            deriveCoolOffStatus(blockedUntil, Date.now() / 1000).endLabel
        }.`
        : undefined
    const betEurMinor = priceWeiEurMinor(quote.total, ethUsd, eurUsd)
    const inflowHeadroomReason = activityState
        && activityState.inflow.capEurMinor !== null
        && betEurMinor !== null
        && betEurMinor > BigInt(activityState.inflow.headroomEurMinor)
        ? 'This entry would exceed your entry allowance. Verify to keep playing.'
        : undefined

    // Single composite reason. Balance issues take precedence — they're cheap
    // to fix and gate everything else. The on-chain hard gates (entry block,
    // inflow headroom) come next; pretx (regulated, off-chain advisory) wins
    // over the bare on-chain compliance read when both fire.
    let error: string | undefined
    if (useWETH) {
        if (quote.total > weth.balance) error = 'Insufficient WETH balance'
    } else if (quote.total > nativeBalance) {
        error = 'Insufficient ETH balance'
    }
    if (!error) error = entryBlockedReason ?? inflowHeadroomReason ?? pretxReason ?? complianceReason

    const enterDraw = async () => {
        if (entriesRawValue < 1) return
        if (useWETH && needsAllowanceApproval) {
            weth.approve(quote.total)
            return
        }
        // Attribution rides along only until the wallet is bound on-chain; after the first
        // attributed entry the immutable binding takes over and the code is consumed.
        const referralCode = !referralBinding.referrer && pendingReferral.isWellFormed
            ? pendingReferral.code
            : undefined
        const ok = await enterDrawAction.enter({
            roundIndex: Number(draw.roundIndex),
            amount: Number(entriesRawValue),
            payoutInWeth: payoutInWETH,
            useWeth: useWETH,
            referralCode,
        })
        if (ok && referralCode) pendingReferral.clear()
    }

    const enterResult = {
        isSuccess: enterDrawAction.isSuccess,
        isLoading: enterDrawAction.isLoading,
        isError: enterDrawAction.isError,
        status: enterDrawAction.status,
    }

    const wethProps: EnterWETHConfig = {
        useWETH,
        setUseWETH,
        needsApproval: needsAllowanceApproval,
    }

    const payoutInWETHProps: PayoutInWETHConfig = {
        payoutInWETH,
        setPayoutInWETH,
    }

    const canEnter = entriesRawValue > 0n
        && !error
        && enterDrawAction.isOperatorApproved
        && enterDrawAction.isPlayerActive

    return {
        entriesRawValue,
        entries,
        setEntries,

        amountPerEntry,
        pea: peaAmounts,
        cf: cfAmounts,
        of: ofAmounts,
        total: totalAmounts,
        cfBasisPoints: CF_BASIS_POINTS,
        ofBasisPoints: operatorFeeBps,
        basisPointsDivisor: BASIS_POINTS_DIVISOR,
        gameConfig: draw.gameConfig,
        selectedGame,

        error,
        purchasingStatus: transactionStatusToInterfaceStatus(enterDrawAction.status),
        enter: enterDraw,
        enterResult,
        nativeBalance,
        weth: wethProps,
        payoutInWETH: payoutInWETHProps,
        canEnter,
        baseBalance: `${formatEtherMaxDecimals(useWETH ? weth.balance : nativeBalance, 2)}`,
        isOperatorApproved: enterDrawAction.isOperatorApproved,
        isPlayerActive: enterDrawAction.isPlayerActive,
        lossLimitBreached,
    }
}
