// This file is managed by `scripts/sync-addresses.js`. Run `bun sync-addresses`
// after each local deploy to refresh it from the two contract repos' `addresses.json`,
// or pipe a Railway-style CHAINS_CONFIG JSON via `--chains-config-json` for hosted chains.
const LOCAL_ADDRESSES: { [key: string]: `0x${string}` } = {
    'fundsManager': '0x6c61a594DaFD426ae350202a71796885164d8eDE',
    'draw': '0xb185E9f6531BA9877741022C92CE858cDCc5760E',
    'quickGame': '0xAe120F0df055428E45b264E7794A18c54a2a3fAF',
    'weth': '0x8e264821AFa98DD104eEcfcfa7FD9f8D8B320adA',
    'aggregatorV3': '0x6A59CC73e334b018C9922793d96Df84B538E6fD5',
    'aggregatorV3Eur': '0xC1e0A9DB9eA830c52603798481045688c8AE99C2',
    'complianceRegistry': '0x683d9CDD3239E0e01E8dC6315fA50AD92aB71D2d',
    'lgo': '0xd9fEc8238711935D6c8d79Bef2B9546ef23FC046',
    'playerRegistry': '0x79E8AB29Ff79805025c9462a2f2F12e9A496f81d',
    'kycRegistry': '0x0a17FabeA4633ce714F1Fa4a2dcA62C3bAc4758d',
}

export default LOCAL_ADDRESSES
