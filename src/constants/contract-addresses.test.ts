import { describe, expect, it } from 'vitest'
import { ContractName, getContractAddress } from './contract-addresses'
import LOCAL_ADDRESSES from './contract-addresses/local'
// Inlined at transform time by Vite. Reading the generator with node:fs does
// not work here: the browser-targeted resolve aliases stub it out.
import syncScriptSource from '../../scripts/sync-addresses.js?raw'

// The address book is generated: `scripts/sync-addresses.js` walks an `ORDER`
// array and writes those keys into `contract-addresses/<chain>.ts`. Nothing
// type-checks that list against the keys the app actually looks up, so a key
// missing from ORDER fails only at runtime, as a zero address plus console
// noise on every render. That is how REFERRAL_MANAGER regressed (BLO-717).
function syncScriptOrder(): string[] {
    const block = syncScriptSource.match(/const ORDER = \[([\s\S]*?)\]/)
    if (!block) throw new Error('could not locate the ORDER array in scripts/sync-addresses.js')
    return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
}

// Mirror of the private KEY_BY_CONTRACT map, so a new ContractName landing
// without a sync key fails this test rather than the browser console.
const KEY_FOR: Record<ContractName, string> = {
    [ContractName.DRAW_MAIN]: 'draw',
    [ContractName.CHAINLINK_AGGREGATOR_V3]: 'aggregatorV3',
    [ContractName.CHAINLINK_AGGREGATOR_EUR_USD]: 'aggregatorV3Eur',
    [ContractName.FUNDS_MANAGER_MAIN]: 'fundsManager',
    [ContractName.APPROVED_OPERATOR_REGISTRY]: 'approvedOperatorRegistry',
    [ContractName.QUICK_GAME]: 'quickGame',
    [ContractName.WETH]: 'weth',
    [ContractName.OPERATOR]: 'operator',
    [ContractName.REFERRAL_MANAGER]: 'referralManager',
    [ContractName.PLAYER_REGISTRY]: 'playerRegistry',
    [ContractName.KYC_REGISTRY]: 'kycRegistry',
}

const ZERO = '0x0000000000000000000000000000000000000000'

describe('contract address book', () => {
    it('syncs every key the app looks up', () => {
        const order = syncScriptOrder()
        const missing = Object.values(ContractName)
            .filter((v): v is ContractName => typeof v === 'number')
            .map((name) => KEY_FOR[name])
            .filter((key) => !order.includes(key))

        expect(missing, `sync-addresses.js ORDER is missing: ${missing.join(', ')}`).toEqual([])
    })

    it('resolves every synced local address to real code, not the zero address', () => {
        for (const [key, address] of Object.entries(LOCAL_ADDRESSES)) {
            expect(address, `${key} must not be the zero address`).not.toBe(ZERO)
        }
    })

    it('returns the zero address for an unknown chain rather than throwing', () => {
        expect(getContractAddress(999999, ContractName.DRAW_MAIN)).toBe(ZERO)
    })
})
