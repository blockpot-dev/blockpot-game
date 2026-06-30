import CurrentRound from '@/components/blockpot/current-round'
import DrawnNumbersPanel from '@/components/blockpot/drawn-numbers-panel'
import EntryPanel from '@/components/blockpot/entries'
import { RegistrationMode } from '@/components/blockpot/entries/EntryButton/EntryButton'
import ConnectWalletPanel from '@/components/blockpot/entries/ConnectWalletPanel'
import InfoPanel from '@/components/blockpot/info-panel'
import RoundDraw from '@/components/blockpot/round-draw'
import Container_Deprecated from '@/components/core/Container/Container'
import HStack from '@/components/core/HStack/HStack'
import useRoundPurchases from '@/hooks/contracts/lottery/useRoundPurchases'
import { useEntryForm } from '@/hooks/entry/useEntryForm'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useFiatConverter, { FiatConverter } from '@/hooks/utilities/useFiatConverter'
import { useLottery } from '@/providers/BlockpotProvider'
import { useLotteryDraw } from '@/providers/BlockpotDrawProvider'
import { usePreviousRoundsPanelOpen } from '@/providers/ModalOpenStateProvider'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { memo } from 'react'
import { useAccount } from 'wagmi'
import PreviousRounds from '@/components/blockpot/previous-rounds'
import PlayHeader from '@/components/blockpot/play/PlayHeader/PlayHeader'
import usePlayerRegistration from '@/hooks/contracts/player-registry/usePlayerRegistration'
import AttestationModal from '@/components/onboarding/AttestationModal'
import useCurrentTos from '@/hooks/tos/useCurrentTos'
import { useCountry } from '@/providers/CountryProvider'
import SelfExclusionRouteGate from '@/components/responsible-gaming/SelfExclusionRouteGate'

function createPrizes(pots: readonly bigint[], fiatConverter: FiatConverter) {
    const prizes = pots.slice(0, 3).map((pot) => ({
        nativeToken: 'ETH',
        tokenAmountFormatted: formatEtherMaxDecimalsGreedy(pot, 2),
        fiatFormatted: fiatConverter(pot).formattedValue
    }))
    const extraPots = pots.slice(3)
    const otherPrizes = extraPots.reduce((acc, pot) => (acc + pot), 0n)
    // Show the "+ More" row whenever the round has pots beyond the first three,
    // even before any entries fund them (their aggregate is 0 ETH / $0).
    if (extraPots.length > 0) {
        prizes.push({
            nativeToken: 'ETH',
            tokenAmountFormatted: formatEtherMaxDecimalsGreedy(otherPrizes, 2),
            fiatFormatted: fiatConverter(otherPrizes).formattedValue
        })
    }
    return prizes
}

function Play() {
    const {
        amountPerEntry,
        enter,
        entries,
        setEntries,
        pea,
        cf,
        of,
        total,
        cfBasisPoints,
        ofBasisPoints,
        basisPointsDivisor,
        error,
        purchasingStatus,
        canEnter,
        baseBalance,
        isLGOWhitelisted,
        isPlayerActive,
        lossLimitBreached,
    } = useEntryForm()

    const playerRegistration = usePlayerRegistration()
    const tosQuery = useCurrentTos(playerRegistration.attestationModalOpen)
    const { country } = useCountry()

    let disabledReason: string | undefined
    if (!isLGOWhitelisted) {
        disabledReason = 'This operator is not whitelisted yet — entries are disabled.'
    } else if (error) {
        disabledReason = error
    }

    const needsRegistration = isLGOWhitelisted && !isPlayerActive && !playerRegistration.isActiveLoading
    // Pre-deposit fallback: player is registered on-chain but the client has no
    // attestation record. Forces them through the attestation modal before the
    // entry form becomes interactive.
    const needsAttestationOnly = isLGOWhitelisted && playerRegistration.needsAttestation
    const registration: RegistrationMode | undefined = (needsRegistration || needsAttestationOnly)
        ? {
            register: needsRegistration ? playerRegistration.register : playerRegistration.startAttestationOnly,
            isSigning: playerRegistration.isSigning || playerRegistration.isSubmittingAny,
            isPending: needsRegistration ? playerRegistration.isPending : false,
            isFailed: needsRegistration ? playerRegistration.isFailed : false,
            disabled: !playerRegistration.serviceConfigured || !playerRegistration.hasAddress,
            disabledReason: !playerRegistration.serviceConfigured
                ? 'Gaming service URL is not configured.'
                : playerRegistration.registerError?.message,
            ...(needsAttestationOnly && !needsRegistration
                ? { idleLabel: 'ACCEPT TERMS', signingLabel: 'SIGNING…' }
                : {}),
        }
        : undefined

    const { isConnected } = useAccount()
    const accountAddress = useAccountAddress()
    const { currentRound, pots } = useLottery()
    const { draw, advanceDraw } = useLotteryDraw()
    let roundIndexForTickets: number
    if (draw) {
        if (draw.drawStage.type === 'waiting') {
            roundIndexForTickets = draw.drawStage.roundIndex
        } else {
            roundIndexForTickets = draw.drawStage.drawnRound.roundIndex
        }
    } else {
        roundIndexForTickets = currentRound.roundIndex
    }
    const roundPurchaseData = useRoundPurchases(roundIndexForTickets)
    const fiatConverter = useFiatConverter({ maxDecimals: 0 })
    const entryInfo = {
        totalTickets: Number(currentRound.entryCount),
        yourTickets: roundPurchaseData.totalTickets
    }
    const isPreviousRoundsOpen = usePreviousRoundsPanelOpen()

    let jackpotAmount = 0n
    if (pots && pots.length > 0) {
        jackpotAmount = pots[0]
    }
    const jackpot = {
        nativeAmount: jackpotAmount,
        fiatAmountFormatted: fiatConverter(jackpotAmount).formattedValue
    }

    const drawRoundInfoSource = (draw && draw.drawStage.type !== 'waiting') ? draw.drawStage.drawnRound : currentRound

    const roundInfo = {
        potIndex: drawRoundInfoSource.potIndex,
        currentRound: drawRoundInfoSource.roundIndexInPot + 1,
        maximumRounds: drawRoundInfoSource.maxRoundsInPot,
        winnerChance: drawRoundInfoSource.chance,
        totalTickets: Number(drawRoundInfoSource.entryCount),
        yourTickets: roundPurchaseData.totalTickets,
        jackpot: jackpotAmount
    }
    const prizes = createPrizes(pots, fiatConverter)

    return (
        <div className='@container flex-1 pb-8'>
            <SelfExclusionRouteGate />
            <PlayHeader isPreviousRoundsOpen={isPreviousRoundsOpen} />
            <Container_Deprecated className='dark mt-8 mb-auto relative'>
                <HStack className='gap-4 justify-center'>
                    {
                        draw ?
                            <DrawnNumbersPanel
                                stagedDraw={draw.drawStage.type !== 'waiting' ? draw.drawStage.stagedDraw : { drawnNumbers: [] }}
                                totalDrawnNumbers={draw.drawStage.type !== 'waiting' ? draw.drawStage.drawnRound.draws.length : 0}
                                advanceDraw={advanceDraw}
                            />
                            :
                            isConnected ?
                                <EntryPanel
                                    status={purchasingStatus}
                                    enter={enter}
                                    selectedEntries={{
                                        value: entries,
                                        update: setEntries,
                                    }}
                                    amountPerEntry={amountPerEntry}
                                    pea={pea}
                                    cf={cf}
                                    of={of}
                                    total={total}
                                    cfBasisPoints={cfBasisPoints}
                                    ofBasisPoints={ofBasisPoints}
                                    basisPointsDivisor={basisPointsDivisor}
                                    error={error}
                                    canEnter={canEnter}
                                    disabledReason={disabledReason}
                                    baseBalance={baseBalance}
                                    registration={registration}
                                    lossLimitBreached={lossLimitBreached}
                                />
                                :
                                <ConnectWalletPanel />
                    }
                    <Container className='p-0' containerClassName='flex-1 min-w-[700px]' highlight highlightBottomBorderHidden>
                        {
                            draw ?
                                <RoundDraw
                                    draw={draw}
                                    roundInfo={roundInfo}
                                    accountAddress={accountAddress}
                                />
                                :
                                <CurrentRound
                                    entryInfo={entryInfo}
                                    roundInfo={roundInfo}
                                    jackpot={jackpot}
                                    prizes={prizes}
                                />
                        }
                    </Container>
                    <InfoPanel
                        purchases={Object.values(roundPurchaseData.purchases)}
                        isConnected={isConnected}
                    />
                </HStack>
            </Container_Deprecated>
            <PreviousRounds accountAddress={accountAddress} isOpen={isPreviousRoundsOpen} />
            <AttestationModal
                open={playerRegistration.attestationModalOpen}
                onOpenChange={(open) => {
                    if (!open) playerRegistration.cancelAttestation()
                    else playerRegistration.setAttestationModalOpen(true)
                }}
                tos={tosQuery.data}
                tosLoading={tosQuery.isLoading}
                tosError={tosQuery.error ? (tosQuery.error as Error).message : undefined}
                submitting={playerRegistration.isSubmittingAny}
                submitError={playerRegistration.registerError?.message}
                onConfirm={(value) => {
                    void playerRegistration.confirmAttestation({
                        dobSelfDeclared: value.dob,
                        jurisdictionSelfDeclared: value.jurisdiction,
                        tosVersionHash: value.tosVersionHash,
                    })
                }}
                onCancel={() => playerRegistration.cancelAttestation()}
                defaultJurisdiction={country ?? undefined}
            />
        </div>
    )
}

export default memo(Play)
