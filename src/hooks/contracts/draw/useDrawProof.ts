import { Address, getContract } from 'viem'
import { useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { randomNumberProviderAbi } from '@/abi/randomNumberProviderAbi'
import { getContractAddress } from '@/constants/contract-addresses'
import useAvailablePublicClient from '@/hooks/web3/useAvailablePublicClient'
import { reproduceDrawnNumbers } from '@/utilities/draw/reproduceDrawnNumbers'
import { DrawProof } from '@/types/draw/drawProof'
import useDrawRead from '../read/useDrawRead'

// Builds the provable-fairness view model for a completed round: reads the VRF
// inputs from the DrawRandomNumberProvider (whose address is derived
// on-chain via draw.randomNumberProvider(), never static config), reproduces
// the draw client-side, and cross-checks it against the on-chain drawn numbers.
// getRandomNumberGeneratorInputsForGameAndRound reverts RequestNotFound until
// the round's VRF request is fulfilled — that revert maps to 'unavailable'.
export default function useDrawProof(roundIndex: number) {
    const chainId = useChainId()
    const publicClient = useAvailablePublicClient()
    const { game, selectedGame, gameContractName } = useDrawRead()

    const { data, isLoading } = useQuery({
        queryKey: ['drawProof', selectedGame, chainId, roundIndex],
        enabled: roundIndex >= 0,
        queryFn: async (): Promise<DrawProof> => {
            const drawAddress = getContractAddress(chainId, gameContractName)
            const randomNumberProviderAddress = await game.randomNumberProvider() as Address
            const provider = getContract({
                address: randomNumberProviderAddress,
                abi: randomNumberProviderAbi,
                client: publicClient,
            })
            const base = { roundIndex, drawAddress, randomNumberProviderAddress }

            try {
                const [requestId, seed, maxNumber, totalNumbers] =
                    await provider.read.getRandomNumberGeneratorInputsForGameAndRound([drawAddress, roundIndex])
                const inputs = {
                    requestId,
                    seed,
                    maxNumber: Number(maxNumber),
                    totalNumbers: Number(totalNumbers),
                }
                const reproducedNumbers = reproduceDrawnNumbers(inputs)
                const roundData = await game.getRoundData([roundIndex])
                const onChainNumbers = roundData.draws.map((draw: { number: number }) => draw.number)
                const matches = reproducedNumbers.length === onChainNumbers.length
                    && reproducedNumbers.every((n, i) => n === onChainNumbers[i])
                return {
                    ...base,
                    inputs,
                    reproducedNumbers,
                    onChainNumbers,
                    matches,
                    status: matches ? 'verified' : 'mismatch',
                }
            } catch {
                return {
                    ...base,
                    inputs: { requestId: 0n, seed: 0n, maxNumber: 0, totalNumbers: 0 },
                    reproducedNumbers: [],
                    onChainNumbers: [],
                    matches: false,
                    status: 'unavailable',
                }
            }
        },
    })

    return { drawProof: data, isLoading }
}
