import { ZERO_ADDRESS } from '@/web3/constants'

const POLYGON_MUMBAI_ADDRESSES: {[key: string]: `0x${string}`} = {
    aggregatorV3: '0x90fF98975aE9cFB6cCe2eF179e41C87913820E6b',
    // TODO: populate from EUR/USD mock deployment on Polygon testnet
    aggregatorV3Eur: ZERO_ADDRESS,
    lottery: '0x8933A9eb812FF88aD9f2Fe4C278C5A1f02209C7B',
    weth: '0xf9a6fEa3D59cb3A2c62D8E2A55d3266Ec39FC15e',
    // TODO: populate from v2 deployment
    fundsManager: ZERO_ADDRESS,
    quickGame: ZERO_ADDRESS,
    complianceRegistry: ZERO_ADDRESS,
    // TODO: populate from LGO deployment on Polygon testnet
    lgo: ZERO_ADDRESS,
    playerRegistry: ZERO_ADDRESS,
    kycRegistry: ZERO_ADDRESS,
}

export default POLYGON_MUMBAI_ADDRESSES
