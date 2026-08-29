import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import useKycTier from '@/hooks/contracts/kyc-registry/useKycTier'
import TierThresholds from './TierThresholds'

/** Phase 1 hides the tier ladder from players (KB blockpot/story-map B-VIS-1/2). */
export const MIN_TIER_TO_SHOW_THRESHOLDS = 1

export function _TierThresholdsGate(props: { tier: number; children: React.ReactNode }) {
    return props.tier >= MIN_TIER_TO_SHOW_THRESHOLDS ? <>{props.children}</> : null
}

/** Renders the KYC tier table only for a connected wallet at Tier 1 or above. */
export default function TierThresholdsGate() {
    const address = useAccountAddress()
    const { tier } = useKycTier(address)
    return (
        <_TierThresholdsGate tier={tier}>
            <TierThresholds />
        </_TierThresholdsGate>
    )
}
