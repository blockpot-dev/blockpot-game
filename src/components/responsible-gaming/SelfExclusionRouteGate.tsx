import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import useSelfExclusion from '@/hooks/responsible-gaming/useSelfExclusion'

// Mounted inside `/play` so a player whose exclusion activates while they are
// sitting on the page is bounced to /responsible-gaming instead of staring at
// a form whose submit button will fail at the pre-tx gate. Withdraw/claim is
// never gated — claiming escrowed winnings is permitted regardless of
// self-exclusion state.
export default function SelfExclusionRouteGate() {
    const { active } = useSelfExclusion()
    const navigate = useNavigate()
    const shouldRedirect = !!active

    useEffect(() => {
        if (shouldRedirect) {
            void navigate({ to: '/responsible-gaming', replace: true })
        }
    }, [shouldRedirect, navigate])

    return null
}
