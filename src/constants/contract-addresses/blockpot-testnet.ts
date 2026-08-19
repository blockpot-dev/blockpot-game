// This file is managed by `scripts/sync-addresses.js`. Run `bun sync-addresses`
// after each local deploy to refresh it from the two contract repos' `addresses.json`,
// or pipe a Railway-style CHAINS_CONFIG JSON via `--chains-config-json` for hosted chains.
const BLOCKPOT_TESTNET_ADDRESSES: { [key: string]: `0x${string}` } = {
    'fundsManager': '0x8dAF17A20c9DBA35f005b6324F493785D239719d',
    'draw': '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    'quickGame': '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
    'weth': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    'aggregatorV3': '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    'aggregatorV3Eur': '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    'approvedOperatorRegistry': '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    'operator': '0x09635F643e140090A9A8Dcd712eD6285858ceBef',
    'playerRegistry': '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44',
    'kycRegistry': '0x59b670e9fA9D0A427751Af201D676719a970857b',
}

export default BLOCKPOT_TESTNET_ADDRESSES
