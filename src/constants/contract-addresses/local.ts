// This file is managed by `scripts/sync-addresses.js`. Run `bun sync-addresses`
// after each local deploy to refresh it from the two contract repos' `addresses.json`,
// or pipe a Railway-style CHAINS_CONFIG JSON via `--chains-config-json` for hosted chains.
const LOCAL_ADDRESSES: { [key: string]: `0x${string}` } = {
    'fundsManager': '0xcb984FEC79e025F03Baa01c5bA94099C84635E87',
    'lottery': '0xC9a43158891282A2B1475592D5719c001986Aaec',
    'quickGame': '0x1c85638e118b37167e9298c2268758e058DdfDA0',
    'weth': '0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8',
    'aggregatorV3': '0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B',
    'aggregatorV3Eur': '0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25',
    'complianceRegistry': '0xD84379CEae14AA33C123Af12424A37803F885889',
    'lgo': '0x4b6aB5F819A515382B0dEB6935D793817bB4af28',
    'playerRegistry': '0x720472c8ce72c2A2D711333e064ABD3E6BbEAdd3',
    'kycRegistry': '0xAA292E8611aDF267e563f334Ee42320aC96D0463',
}

export default LOCAL_ADDRESSES
