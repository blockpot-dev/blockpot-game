import { Meta, StoryObj } from '@storybook/react'
import ClaimDecisionView from './ClaimDecision'
import { ClaimDecision } from '@/hooks/claim/types'

const meta: Meta<typeof ClaimDecisionView> = {
    component: ClaimDecisionView,
}

export default meta
type Story = StoryObj<typeof ClaimDecisionView>

const noop = () => { /* storybook */ }

function decision(over: Partial<ClaimDecision>): ClaimDecision {
    return {
        allow: false,
        reason: '',
        requiredAction: 'KYC_UPGRADE',
        ...over,
    }
}

export const KycUpgradeDialog: Story = {
    args: {
        decision: decision({ requiredAction: 'KYC_UPGRADE' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}

export const HeadroomExceeded: Story = {
    args: {
        decision: decision({ requiredAction: 'HEADROOM_EXCEEDED' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}

export const LimitExceeded: Story = {
    args: {
        decision: decision({ requiredAction: 'LIMIT_EXCEEDED' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}

export const SanctionsBlock: Story = {
    args: {
        decision: decision({ requiredAction: 'SANCTIONS_BLOCK' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}

export const SybilBlock: Story = {
    args: {
        decision: decision({ requiredAction: 'SYBIL_BLOCK' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}

export const SequencerDown: Story = {
    args: {
        decision: decision({ requiredAction: 'SEQUENCER_DOWN' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}

export const SelfExcluded: Story = {
    args: {
        decision: decision({ requiredAction: 'SELF_EXCLUDED' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}

export const GeoBlock: Story = {
    args: {
        decision: decision({ requiredAction: 'GEO_BLOCK' }),
        onClose: noop,
        onVerify: noop,
        onRetry: noop,
    },
}
