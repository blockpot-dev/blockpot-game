import WalletOptionsDialog from '@/components/web3/WalletOptionsDialog'
import { useModalOpenState } from '@/providers/ModalOpenStateProvider'
import MissedDrawDialog from './MissedDrawDialog'
import { useMissedDraw } from '@/providers/MissedDrawProvider'
import { useSelectedGame } from '@/providers/SelectedGameProvider'

export default function Modals() {
    const { walletOptionsDialogOpen } = useModalOpenState()
    const { missedRoundIndex } = useMissedDraw()
    const { selectedGame } = useSelectedGame()

    return <>
        <WalletOptionsDialog open={walletOptionsDialogOpen.value} onClose={() => walletOptionsDialogOpen.update(false)} />
        {missedRoundIndex !== null && <MissedDrawDialog roundIndex={missedRoundIndex} gameType={selectedGame} />}
    </>
}
