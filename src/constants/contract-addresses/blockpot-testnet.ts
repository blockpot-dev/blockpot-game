// This file is managed by `scripts/sync-addresses.js`. Run `bun sync-addresses`
// after each local deploy to refresh it from the two contract repos' `addresses.json`,
// or pipe a Railway-style CHAINS_CONFIG JSON via `--chains-config-json` for hosted chains.
const BLOCKPOT_TESTNET_ADDRESSES: { [key: string]: `0x${string}` } = {
    'fundsManager': '0xb4dC171C0edEc8C0032cd0f2d30921c09FA35e34',
    'lottery': '0x998abeb3E57409262aE5b751f60747921B33613E',
    'quickGame': '0x70e0bA845a1A0F2DA3359C97E0285013525FFC49',
    'weth': '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690',
    'aggregatorV3': '0x9E545E3C0baAB3E08CdfD552C960A1050f373042',
    'aggregatorV3Eur': '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
    'complianceRegistry': '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
    'lgo': '0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3',
    'playerRegistry': '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
    'kycRegistry': '0x4c5859f0F772848b2D91F1D83E2Fe57935348029',
}

export default BLOCKPOT_TESTNET_ADDRESSES
