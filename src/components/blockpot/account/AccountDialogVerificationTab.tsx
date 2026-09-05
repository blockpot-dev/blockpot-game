import VStack from '@/components/core/VStack/VStack'
import VerificationStatusRow from '@/components/blockpot/verification/VerificationStatusRow'

// The verification tab under silent tiers (BLO-675).
//
// It used to render the ladder: a gate-by-gate breakdown, an escalating upgrade
// prompt, and a pending-CDD banner. All three are gone. The interface shows no
// tier names, no headroom meters and no verification menu, because a standing
// ladder shows every player a compliance apparatus that fewer than one in
// twenty will ever climb.
//
// What is left is Surface 4, and Surface 4 renders nothing until the player has
// actually been asked for ID. So for most players this tab is empty, and that
// is the intended end state rather than an oversight — verification reaches a
// player at the action that needs it (Surface 1), not from a menu they browse.
//
// If you are here to "fill this in", read the master issue first.

export type AccountDialogVerificationTabProps = {
    onVerify: () => void
}

export default function AccountDialogVerificationTab({ onVerify }: AccountDialogVerificationTabProps) {
    return (
        <VStack className='gap-6'>
            <VerificationStatusRow onVerify={onVerify} />
        </VStack>
    )
}
