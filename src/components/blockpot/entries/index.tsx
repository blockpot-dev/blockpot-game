import { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import EntryOptions, { EntryOptionsProps } from './EntryOptions/EntryOptions'
import EntrySummary, { EntrySummaryProps } from './EntrySummary/EntrySummary'
import VStack from '@/components/core/VStack/VStack'
import { InterfaceStatus } from '@/types/ui/interface-status'
import { Container } from '@blockpot-dev/blockpot-design-system'
import EntryButton, { RegistrationMode } from './EntryButton/EntryButton'
import LossLimitWarning from '@/components/responsible-gaming/LossLimitWarning'

export type EntryPanelProps = {
    enter: () => void
    status: InterfaceStatus
    canEnter: boolean
    disabledReason?: string
    error?: string
    registration?: RegistrationMode
    lossLimitBreached?: boolean
    /** Optional referral-code disclosure rendered directly above the entry button. */
    referral?: ReactNode
} & EntryOptionsProps & EntrySummaryProps;

export default function EntryPanel(props: EntryPanelProps) {
    const { status, enter, canEnter, disabledReason, error, registration, lossLimitBreached, referral } = props
    const needsRegistration = !!registration
    const dimmed = needsRegistration ? 'opacity-50 pointer-events-none select-none' : ''
    const showErrorBanner = !needsRegistration && !!error && !lossLimitBreached
    const showLossLimitBanner = !needsRegistration && !!lossLimitBreached

    return (
        <Container containerClassName='w-[300px] flex-1 flex flex-col' className='p-6 flex-1 flex flex-col'>
            <VStack className='gap-8 flex-1'>
                <div className={dimmed} aria-disabled={needsRegistration}>
                    <EntryOptions
                        selectedEntries={props.selectedEntries}
                        amountPerEntry={props.amountPerEntry}
                    />
                </div>
                <div className={dimmed} aria-disabled={needsRegistration}>
                    <EntrySummary
                        pea={props.pea}
                        cf={props.cf}
                        of={props.of}
                        total={props.total}
                        baseBalance={props.baseBalance}
                        cfBasisPoints={props.cfBasisPoints}
                        ofBasisPoints={props.ofBasisPoints}
                        basisPointsDivisor={props.basisPointsDivisor}
                        gameConfig={props.gameConfig}
                        selectedGame={props.selectedGame}
                    />
                </div>
                <VStack className='gap-3'>
                    {showLossLimitBanner && <LossLimitWarning />}
                    {showErrorBanner && (
                        <div
                            role='alert'
                            className='flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/15 text-destructive px-3 py-2'
                        >
                            <AlertCircle className='mt-0.5 size-4 shrink-0' />
                            <span className='text-xs leading-snug'>{error}</span>
                        </div>
                    )}
                    {referral}
                </VStack>
                <div className='mt-auto'>
                    <EntryButton
                        enter={enter}
                        status={status}
                        canEnter={canEnter}
                        disabledReason={disabledReason}
                        registration={registration}
                    />
                </div>
            </VStack>
        </Container>
    )
}
