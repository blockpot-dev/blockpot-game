// This file is managed by `scripts/sync-addresses.js`. Run `bun sync-addresses`
// after each local deploy to refresh it from the two contract repos' `addresses.json`,
// or pipe a Railway-style CHAINS_CONFIG JSON via `--chains-config-json` for hosted chains.
const LOCAL_ADDRESSES: { [key: string]: `0x${string}` } = {
    'fundsManager': '0x94099942864EA81cCF197E9D71ac53310b1468D8',
    'lottery': '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    'quickGame': '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    'weth': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    'aggregatorV3': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    'aggregatorV3Eur': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    'complianceRegistry': '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    'lgo': '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
    'playerRegistry': '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
    'kycRegistry': '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
}

export default LOCAL_ADDRESSES
