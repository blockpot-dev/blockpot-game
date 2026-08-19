import { ZERO_ADDRESS } from '@/web3/constants'
import { Address } from 'viem'
import { NetworkId } from './network-details'
import POLYGON_MUMBAI_ADDRESSES from './contract-addresses/polygon-testnet'
import ARBITRUM_TESTNET_ADDRESSES from './contract-addresses/arbitrum-testnet'
import LOCAL_ADDRESSES from './contract-addresses/local'
import BLOCKPOT_TESTNET_ADDRESSES from './contract-addresses/blockpot-testnet'

export enum ContractName {
    DRAW_MAIN,
    CHAINLINK_AGGREGATOR_V3,
    CHAINLINK_AGGREGATOR_EUR_USD,
    FUNDS_MANAGER_MAIN,
    COMPLIANCE_REGISTRY,
    QUICK_GAME,
    WETH,
    LGO,
    REFERRAL_MANAGER,
    PLAYER_REGISTRY,
    KYC_REGISTRY,
}

const ADDRESSES_BY_CHAIN: { [chainId: number]: { [key: string]: `0x${string}` } } = {
    [NetworkId.LOCAL]: LOCAL_ADDRESSES,
    [NetworkId.POLYGON_TESTNET]: POLYGON_MUMBAI_ADDRESSES,
    [NetworkId.ARBITRUM_TESTNET]: ARBITRUM_TESTNET_ADDRESSES,
    [NetworkId.BLOCK_POT_TESTNET]: BLOCKPOT_TESTNET_ADDRESSES,
}

const KEY_BY_CONTRACT: Record<ContractName, string> = {
    [ContractName.DRAW_MAIN]: 'lottery', // TODO(BLO-693): addresses.json key renames to 'draw'
    [ContractName.CHAINLINK_AGGREGATOR_V3]: 'aggregatorV3',
    [ContractName.CHAINLINK_AGGREGATOR_EUR_USD]: 'aggregatorV3Eur',
    [ContractName.FUNDS_MANAGER_MAIN]: 'fundsManager',
    [ContractName.COMPLIANCE_REGISTRY]: 'complianceRegistry',
    [ContractName.QUICK_GAME]: 'quickGame',
    [ContractName.WETH]: 'weth',
    [ContractName.LGO]: 'lgo',
    [ContractName.REFERRAL_MANAGER]: 'referralManager',
    [ContractName.PLAYER_REGISTRY]: 'playerRegistry',
    [ContractName.KYC_REGISTRY]: 'kycRegistry',
}

export function getContractAddress(chainId: number, contractName: ContractName): Address {
    const address = ADDRESSES_BY_CHAIN[chainId]?.[KEY_BY_CONTRACT[contractName]]
    if (!address) {
        console.error(`Failed to find contract address for chainId: ${chainId} and contractName: ${contractName}`)
        return ZERO_ADDRESS
    }
    return address
}
