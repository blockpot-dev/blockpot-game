import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { Address, formatUnits, getContract } from 'viem'
import { useMemo } from 'react'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { aggregatorV3InterfaceAbi } from '@/abi-3p/aggregatorV3InterfaceAbi'
import { ZERO_ADDRESS } from '@/web3/constants'
import useAvailablePublicClient from '@/hooks/web3/useAvailablePublicClient'
import { PriceInfo } from './useNativeCurrencyToUSDPrice'
import { formatNumber } from '@/utilities/formatters'

// EUR/USD chainlink price feed reader. Mirrors `useNativeCurrencyToUSDPrice`
// for the second leg of the on-chain `_priceWeiEur` formula
// (eur8 = wei * ethUsd / (eurUsd * 1e10)). Returns the zero PriceInfo when
// the chain has no EUR/USD feed wired (today: every chain except LOCAL).
export function useEurToUSDPrice(): PriceInfo {
    const chainId = useChainId()
    const address = getContractAddress(chainId, ContractName.CHAINLINK_AGGREGATOR_EUR_USD) as Address
    const publicClient = useAvailablePublicClient()

    const aggregator = useMemo(() => getContract({
        address,
        abi: aggregatorV3InterfaceAbi,
        client: publicClient,
    }), [address, publicClient])

    const enabled = address !== ZERO_ADDRESS
    const { data } = useQuery({
        queryKey: ['eurUsdPrice', chainId, address],
        queryFn: async () => {
            const latestRoundData = await aggregator.read.latestRoundData()
            const decimals = await aggregator.read.decimals()
            return { latestRoundData, decimals }
        },
        enabled,
        staleTime: 60 * 1_000,
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

    const formattedBigNumber = formatUnits(data.latestRoundData[1], data.decimals)
    const value = parseFloat(formattedBigNumber)
    const formatted = formatNumber(value, 4)
    return {
        id: formatUnits(data.latestRoundData[0], 0),
        formatted,
        value,
        bigNumber: data.latestRoundData[1],
        decimals: data.decimals,
    }
}
