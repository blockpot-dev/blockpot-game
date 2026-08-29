import CurrentRound from '@/components/blockpot/current-round'
import DrawnNumbersPanel from '@/components/blockpot/drawn-numbers-panel'
import EntryPanel from '@/components/blockpot/entries'
import { RegistrationMode } from '@/components/blockpot/entries/EntryButton/EntryButton'
import ConnectWalletPanel from '@/components/blockpot/entries/ConnectWalletPanel'
import InfoPanel from '@/components/blockpot/info-panel'
import RoundDraw from '@/components/blockpot/round-draw'
import Container_Deprecated from '@/components/core/Container/Container'
import HStack from '@/components/core/HStack/HStack'
import useRoundPurchases from '@/hooks/contracts/draw/useRoundPurchases'
import { useEntryForm } from '@/hooks/entry/useEntryForm'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useFiatConverter, { FiatConverter } from '@/hooks/utilities/useFiatConverter'
import { useDraw } from '@/providers/BlockpotProvider'
import { useBlockpotDraw } from '@/providers/BlockpotDrawProvider'
import { useDrawSummaryDialogOpen, usePreviousRoundsPanelOpen } from '@/providers/ModalOpenStateProvider'
import { formatEtherMaxDecimalsGreedy } from '@/utilities/formatters'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { memo } from 'react'
import { useAccount } from 'wagmi'
import PreviousRounds from '@/components/blockpot/previous-rounds'
import PlayHeader from '@/components/blockpot/play/PlayHeader/PlayHeader'
import ReferralBanner from '@/components/blockpot/play/ReferralBanner/ReferralBanner'
import VStack from '@/components/core/VStack/VStack'
import usePlayerRegistration from '@/hooks/contracts/player-registry/usePlayerRegistration'
import usePlayerStatus from '@/hooks/contracts/player-registry/usePlayerStatus'
import { deriveEntryGate } from '@/components/blockpot/play/entryGate'
import { ZERO_ADDRESS } from '@/web3/constants'
import AttestationModal from '@/components/onboarding/AttestationModal'
import useCurrentTos from '@/hooks/tos/useCurrentTos'
import { useCountry } from '@/providers/CountryProvider'
import SelfExclusionRouteGate from '@/components/responsible-gaming/SelfExclusionRouteGate'
import RealityCheckHost from '@/components/responsible-gaming/RealityCheckHost'

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
        gameConfig,
        selectedGame,
        error,
        purchasingStatus,
        canEnter,
        baseBalance,
        isOperatorApproved,
        isPlayerActive,
        lossLimitBreached,
    } = useEntryForm()

    const playerRegistration = usePlayerRegistration()
    const tosQuery = useCurrentTos(playerRegistration.attestationModalOpen)
    const { country } = useCountry()

    const accountAddress = useAccountAddress()
    const { status: playerStatus, isLoading: isStatusLoading } = usePlayerStatus(accountAddress ?? ZERO_ADDRESS)
    // BLO-734: only a wallet the registry has never seen registers; a
    // suspended/banned player gets a disabled entry CTA with the reason
    // instead of an enabled REGISTER button whose tx reverts.
    const gate = deriveEntryGate({
        isOperatorApproved,
        playerStatus,
        isStatusLoading,
        isActiveLoading: playerRegistration.isActiveLoading,
    })

    let disabledReason: string | undefined
    if (!isOperatorApproved) {
        disabledReason = 'This operator is not whitelisted yet — entries are disabled.'
    } else if (gate.accessReason) {
        disabledReason = gate.accessReason
    } else if (error) {
        disabledReason = error
    }

    const needsRegistration = gate.needsRegistration && !isPlayerActive
    // Pre-deposit fallback: player is registered on-chain but the client has no
    // attestation record. Forces them through the attestation modal before the
    // entry form becomes interactive.
    const needsAttestationOnly = isOperatorApproved && playerRegistration.needsAttestation
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
    const { currentRound, pots, roundIndex: drawStateRoundIndex } = useDraw()
    // useDrawState returns undefined until the first read resolves; the provider
    // substitutes DEFAULT_DRAW (roundIndex -1) in the meantime.
    const isDrawStateLoading = drawStateRoundIndex === -1
    const { draw, advanceDraw } = useBlockpotDraw()
    const drawSummaryDialogOpen = useDrawSummaryDialogOpen()
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

    let prizePoolAmount = 0n
    if (pots && pots.length > 0) {
        prizePoolAmount = pots[0]
    }
    const prizePool = {
        nativeAmount: prizePoolAmount,
        fiatAmountFormatted: fiatConverter(prizePoolAmount).formattedValue,
        isLoading: isDrawStateLoading
    }

    const drawRoundInfoSource = (draw && draw.drawStage.type !== 'waiting') ? draw.drawStage.drawnRound : currentRound

    const roundInfo = {
        potIndex: drawRoundInfoSource.potIndex,
        currentRound: drawRoundInfoSource.roundIndexInPot + 1,
        maximumRounds: drawRoundInfoSource.maxRoundsInPot,
        winnerChance: drawRoundInfoSource.chance,
        totalTickets: Number(drawRoundInfoSource.entryCount),
        yourTickets: roundPurchaseData.totalTickets,
        prizePool: prizePoolAmount
    }
    const prizes = createPrizes(pots, fiatConverter)

    return (
        <div className='@container flex-1 pb-8'>
            <SelfExclusionRouteGate />
            <RealityCheckHost />
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
                                <VStack className='gap-3 self-stretch'>
                                    <EntryPanel
                                        referral={<ReferralBanner />}
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
                                        gameConfig={gameConfig}
                                        selectedGame={selectedGame}
                                        error={gate.accessReason ?? error}
                                        canEnter={canEnter}
                                        disabledReason={disabledReason}
                                        baseBalance={baseBalance}
                                        registration={registration}
                                        lossLimitBreached={lossLimitBreached}
                                    />
                                </VStack>
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
                                    onSeeResults={() => drawSummaryDialogOpen.update(true)}
                                />
                                :
                                <CurrentRound
                                    entryInfo={entryInfo}
                                    roundInfo={roundInfo}
                                    prizePool={prizePool}
                                    prizes={prizes}
                                />
                        }
                    </Container>
                    <InfoPanel
                        purchases={Object.values(roundPurchaseData.purchases)}
                        isConnected={isConnected}
                        isLoading={roundPurchaseData.isLoading}
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
