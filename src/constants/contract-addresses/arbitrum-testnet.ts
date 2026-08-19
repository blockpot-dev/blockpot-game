import { ZERO_ADDRESS } from '@/web3/constants'

const ARBITRUM_TESTNET_ADDRESSES: {[key: string]: `0x${string}`} = {
    'aggregatorV3': '0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08',
    // TODO: populate from EUR/USD mock deployment on Arbitrum testnet
    'aggregatorV3Eur': ZERO_ADDRESS,
    'fundsManager': '0x76e161eA9377341Fb331947dDB0B10FE44635F83',
    'draw': '0xcB6a94FA4A8FF21a909caD81D2FfF609279B5F0e',
    'weth': '0xEe01c0CD76354C383B8c7B4e65EA88D00B06f36f',
    // TODO: populate from v2 deployment
    'quickGame': ZERO_ADDRESS,
    'complianceRegistry': ZERO_ADDRESS,
    // TODO: populate from LGO deployment on Arbitrum testnet
    'lgo': ZERO_ADDRESS,
    'playerRegistry': ZERO_ADDRESS,
    'kycRegistry': ZERO_ADDRESS,
}

export default ARBITRUM_TESTNET_ADDRESSES
