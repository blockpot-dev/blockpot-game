/* eslint-disable @typescript-eslint/no-require-imports */
// Sync deployment addresses into src/constants/contract-addresses/<chain>.ts.
//
// Two modes:
//
// 1. Two-file split (default — used by local hardhat workflow):
//    Sources:
//      ../unipot-contracts/script/input/<chainId>/addresses.json   — core protocol
//      ../blockpot-contracts/script/output/<chainId>/addresses.json     — LGO stack
//
//    Run after each local deploy: `bun sync-addresses`
//
//    Usage:
//      node scripts/sync-addresses.js              # default: local (31337) -> local.ts
//      node scripts/sync-addresses.js --chain=31337
//      node scripts/sync-addresses.js --chain=69696
//
// 2. CHAINS_CONFIG JSON (used by Railway / CI builds):
//    Reads the unified `CHAINS_CONFIG` JSON shape (same schema the
//    gaming-service consumes) from either the `CHAINS_CONFIG` env var or
//    stdin. Picks the entry whose `chainId` matches `--chain=` and writes
//    it to the corresponding TS file.
//
//    Usage:
//      CHAINS_CONFIG="$(cat chains.json)" node scripts/sync-addresses.js \
//          --chain=69696 --chains-config-json
//      cat chains.json | node scripts/sync-addresses.js \
//          --chain=69696 --chains-config-json

const fs = require('fs')
const path = require('path')

const REPO_ROOT = path.resolve(__dirname, '..')

const CHAIN_CONFIG = {
    31337: {
        outputFile: 'src/constants/contract-addresses/local.ts',
        constName: 'LOCAL_ADDRESSES',
    },
    69696: {
        outputFile: 'src/constants/contract-addresses/blockpot-testnet.ts',
        constName: 'BLOCKPOT_TESTNET_ADDRESSES',
    },
}

/** Maps a raw JSON key from a two-file-split addresses.json source onto the frontend's key name. */
const KEY_MAP_TWO_FILE = {
    // from unipot-contracts/script/input/<chain>/addresses.json
    aggregatorV3:         'aggregatorV3',
    aggregatorV3Eur:      'aggregatorV3Eur',
    complianceRegistry:   'complianceRegistry',
    lottery:              'lottery',
    mainGameFundsManager: 'fundsManager',
    quickGame:            'quickGame',
    weth:                 'weth',
    // from blockpot-contracts/script/output/<chain>/addresses.json
    lgo:                       'lgo',
    playerRegistry:            'playerRegistry',
    kycRegistry:               'kycRegistry',
}

/**
 * Maps CHAINS_CONFIG `contracts` keys onto the frontend's key names. The
 * gaming-service schema renames the chainlink feeds (ethUsdFeed / eurUsdFeed)
 * and exposes a richer set than the frontend currently consumes; unmapped
 * keys are silently dropped.
 */
const KEY_MAP_CHAINS_CONFIG = {
    lottery:            'lottery',
    quickGame:          'quickGame',
    complianceRegistry: 'complianceRegistry',
    weth:               'weth',
    ethUsdFeed:         'aggregatorV3',
    eurUsdFeed:         'aggregatorV3Eur',
    fundsManager:       'fundsManager',
    lgo:                'lgo',
    playerRegistry:     'playerRegistry',
    kycRegistry:        'kycRegistry',
}

const ORDER = [
    'fundsManager',
    'lottery',
    'quickGame',
    'weth',
    'aggregatorV3',
    'aggregatorV3Eur',
    'complianceRegistry',
    'lgo',
    'playerRegistry',
    'kycRegistry',
]

function readJsonOrNull(p) {
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function readStdinSync() {
    try {
        return fs.readFileSync(0, 'utf8')
    } catch {
        return ''
    }
}

function collectAddressesTwoFile(chainId) {
    const coreJson = readJsonOrNull(
        path.resolve(REPO_ROOT, `../unipot-contracts/script/input/${chainId}/addresses.json`),
    )
    const lgoJson = readJsonOrNull(
        path.resolve(REPO_ROOT, `../blockpot-contracts/script/output/${chainId}/addresses.json`),
    )

    if (!coreJson && !lgoJson) {
        throw new Error(`No addresses.json found for chain ${chainId} in either repo`)
    }

    const out = {}
    for (const [rawKey, targetKey] of Object.entries(KEY_MAP_TWO_FILE)) {
        const value = (lgoJson && lgoJson[rawKey]) || (coreJson && coreJson[rawKey])
        if (value) out[targetKey] = value
    }
    return out
}

function collectAddressesChainsConfig(chainId) {
    const raw = process.env.CHAINS_CONFIG && process.env.CHAINS_CONFIG.length > 0
        ? process.env.CHAINS_CONFIG
        : readStdinSync()
    if (!raw || raw.trim().length === 0) {
        throw new Error('CHAINS_CONFIG mode: no JSON found in CHAINS_CONFIG env var or stdin')
    }

    let parsed
    try {
        parsed = JSON.parse(raw)
    } catch (err) {
        throw new Error(`CHAINS_CONFIG mode: invalid JSON — ${err.message}`)
    }

    // The canonical wire format (deployer stdout, gaming-service env, Railway
    // shared variable) is a bare array of chain entries. Some older callers
    // wrap it in `{ chains: [...] }`; accept either shape so we don't break
    // them.
    const chains = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.chains) ? parsed.chains : null
    if (!chains) {
        throw new Error('CHAINS_CONFIG mode: expected a JSON array (or `{ chains: [...] }`) at the top level')
    }

    const targetId = Number(chainId)
    const entry = chains.find(c => Number(c?.chainId) === targetId)
    if (!entry) {
        throw new Error(`CHAINS_CONFIG mode: no chain entry for chainId ${chainId}`)
    }
    if (!entry.contracts || typeof entry.contracts !== 'object') {
        throw new Error(`CHAINS_CONFIG mode: chain ${chainId} has no "contracts" object`)
    }

    const out = {}
    for (const [rawKey, targetKey] of Object.entries(KEY_MAP_CHAINS_CONFIG)) {
        const value = entry.contracts[rawKey]
        if (value) out[targetKey] = value
    }
    return out
}

function renderAddressesTs(constName, addresses) {
    const lines = [
        '// This file is managed by `scripts/sync-addresses.js`. Run `bun sync-addresses`',
        '// after each local deploy to refresh it from the two contract repos\' `addresses.json`,',
        '// or pipe a Railway-style CHAINS_CONFIG JSON via `--chains-config-json` for hosted chains.',
        `const ${constName}: { [key: string]: \`0x\${string}\` } = {`,
    ]
    for (const key of ORDER) {
        const value = addresses[key]
        if (!value) continue
        lines.push(`    '${key}': '${value}',`)
    }
    lines.push('}')
    lines.push('')
    lines.push(`export default ${constName}`)
    lines.push('')
    return lines.join('\n')
}

function main() {
    const chainArg = process.argv.find(a => a.startsWith('--chain='))
    const chainId = chainArg ? chainArg.split('=')[1] : '31337'
    const useChainsConfig = process.argv.includes('--chains-config-json')

    const config = CHAIN_CONFIG[chainId]
    if (!config) throw new Error(`Unsupported chain ${chainId} — extend CHAIN_CONFIG to add it`)

    const addresses = useChainsConfig
        ? collectAddressesChainsConfig(chainId)
        : collectAddressesTwoFile(chainId)

    const outputPath = path.resolve(REPO_ROOT, config.outputFile)
    fs.writeFileSync(outputPath, renderAddressesTs(config.constName, addresses))
    console.log(`Wrote ${Object.keys(addresses).length} addresses to ${config.outputFile}`)
    for (const key of ORDER) {
        if (addresses[key]) console.log(`  ${key.padEnd(20)} ${addresses[key]}`)
    }
}

main()
