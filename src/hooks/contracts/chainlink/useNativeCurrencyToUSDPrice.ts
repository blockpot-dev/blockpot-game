import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { useChainId } from 'wagmi'
import { formatNumber } from '../../../utilities/formatters'
import useChainlinkAggregatorRead from '../read/useChainlinkAggregatorRead'

export function convert(base: bigint, toPriceInfo: PriceInfo) {
    return base * toPriceInfo.bigNumber / (10n ** BigInt(toPriceInfo.decimals))
}

export type PriceInfo = {
    id: string,
    formatted: string
    value: number
    bigNumber: bigint,
    decimals: number,
}

export function useNativeCurrencyToUSDPrice(): PriceInfo {
    const chainId = useChainId()
    const aggregator = useChainlinkAggregatorRead()

    const { data } = useQuery({
        queryKey: ['nativeCurrencyToUSDPrice', chainId],
        queryFn: async () => {
            const latestRoundData = await aggregator.latestRoundData()
            const decimals = await aggregator.decimals()
            return {
                latestRoundData,
                decimals
            }
        },
        staleTime: 60 * 1_000
    })
    if (!data) {
        return {
            id: '0',
            formatted: '0.00',
            value: 0,
            bigNumber: 0n,
            decimals: 0,
        }
    }

    const formattedBigNumber = formatUnits(data.latestRoundData[1] /* 1 is the answer */, data.decimals)
    const value = parseFloat(formattedBigNumber)
    const formatted = formatNumber(value, 2)
    return {
        id:  formatUnits(data.latestRoundData[0] /* 0 is the roundId */, 0),
        formatted,
        value: value,
        bigNumber: data.latestRoundData[1] /* 1 is the answer */,
        decimals: data.decimals
    }
}