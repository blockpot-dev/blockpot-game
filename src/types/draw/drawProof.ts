import { Address } from 'viem'

export type DrawProofInputs = {
    /** Chainlink VRF requestId for (lottery, roundIndex); 0n => unavailable */
    requestId: bigint
    /** VRF random word (uint256) used to derive the draw */
    seed: bigint
    /** Inclusive upper bound of a drawn number (uint48) */
    maxNumber: number
    /** Count of numbers drawn (uint8) */
    totalNumbers: number
}

export type DrawProofStatus = 'unavailable' | 'pending' | 'verified' | 'mismatch'

export type DrawProof = {
    roundIndex: number
    /** The Unipot Draw core == Blockpot round host. Field name tracks the verification payload — TODO(BLO-693). */
    lotteryAddress: Address
    /** Derived on-chain via lottery.randomNumberProvider() */
    randomNumberProviderAddress: Address
    inputs: DrawProofInputs
    /** Output of reproduceDrawnNumbers(inputs) */
    reproducedNumbers: readonly number[]
    /** From useRoundDraw()/getRoundData -> draws */
    onChainNumbers: readonly number[]
    /** reproducedNumbers deep-equals onChainNumbers */
    matches: boolean
    status: DrawProofStatus
}
