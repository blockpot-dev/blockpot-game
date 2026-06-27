import { ContractName } from '@/constants/contract-addresses'
import useReadContract from './useReadContract'
import { aggregatorV3InterfaceAbi } from '@/abi-3p/aggregatorV3InterfaceAbi'

export default function useChainlinkAggregatorRead() {
    return useReadContract(ContractName.CHAINLINK_AGGREGATOR_V3, aggregatorV3InterfaceAbi).read
}