import { Abi, Address, PublicClient } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import { ContractName } from '@/constants/contract-addresses'

// Contract identity verification (task 115). Every first-party deployable
// implements the Chainlink-style `typeAndVersion()` getter returning
// "<ContractType> <semver>" (single space, type == Solidity contract name).
// The verifier probes a configured address once per (chainId, address) per
// session and classifies what actually lives there, so a stale or wrong
// address surfaces as a readable message instead of silent garbage reads.

export type ContractIdentityStatus =
    | { kind: 'ok', type: string, version: string }
    | { kind: 'no-code' } // address has no bytecode on this chain
    | { kind: 'not-identifiable' } // code present, typeAndVersion() reverted
    | { kind: 'type-mismatch', found: string } // e.g. expected KYCRegistry, found Lottery
    | { kind: 'version-mismatch', found: string } // type ok, major version differs

export interface ExpectedIdentity {
    type: string // e.g. 'KYCRegistry' — the Solidity contract name
    majorVersion: number // mismatch warns, does not block
}

// null = third-party contract (no typeAndVersion()) — skipped, never flagged.
export const EXPECTED_IDENTITY: Record<ContractName, ExpectedIdentity | null> = {
    [ContractName.DRAW_MAIN]: { type: 'Lottery', majorVersion: 1 },
    [ContractName.CHAINLINK_AGGREGATOR_V3]: null,
    [ContractName.CHAINLINK_AGGREGATOR_EUR_USD]: null,
    [ContractName.FUNDS_MANAGER_MAIN]: { type: 'UnipotFundsManager', majorVersion: 1 },
    [ContractName.COMPLIANCE_REGISTRY]: { type: 'ComplianceRegistry', majorVersion: 1 },
    [ContractName.QUICK_GAME]: { type: 'Lottery', majorVersion: 1 },
    [ContractName.WETH]: null,
    [ContractName.LGO]: { type: 'LGO', majorVersion: 1 },
    [ContractName.PLAYER_REGISTRY]: { type: 'PlayerRegistry', majorVersion: 1 },
    [ContractName.KYC_REGISTRY]: { type: 'KYCRegistry', majorVersion: 1 },
    [ContractName.REFERRAL_MANAGER]: { type: 'ReferralManager', majorVersion: 1 },
}

const TYPE_AND_VERSION_ABI = [
    {
        type: 'function',
        name: 'typeAndVersion',
        inputs: [],
        outputs: [{ type: 'string' }],
        stateMutability: 'pure',
    },
] as const satisfies Abi

// One probe per (chainId, address) per session; the cached verdict also
// dedupes toasts — surfacing happens only when a probe actually runs.
const cache = new Map<string, ContractIdentityStatus>()

export function clearIdentityCache() {
    cache.clear()
}

function classify(identity: string, expected: ExpectedIdentity): ContractIdentityStatus {
    const [type, version = ''] = identity.split(' ')
    if (type !== expected.type) return { kind: 'type-mismatch', found: identity }
    const major = Number(version.split('.')[0])
    if (major !== expected.majorVersion) return { kind: 'version-mismatch', found: identity }
    return { kind: 'ok', type, version }
}

export async function verifyContractIdentity(
    client: PublicClient,
    address: Address,
    expected: ExpectedIdentity,
): Promise<ContractIdentityStatus> {
    if (address === ZERO_ADDRESS) return { kind: 'no-code' }

    const key = `${client.chain?.id ?? 0}:${address.toLowerCase()}`
    const hit = cache.get(key)
    if (hit) return hit

    let status: ContractIdentityStatus
    const code = await client.getCode({ address })
    if (!code || code === '0x') {
        status = { kind: 'no-code' }
    } else {
        try {
            const identity = await client.readContract({
                address,
                abi: TYPE_AND_VERSION_ABI,
                functionName: 'typeAndVersion',
            })
            status = classify(identity as string, expected)
        } catch {
            status = { kind: 'not-identifiable' }
        }
    }
    cache.set(key, status)
    return status
}
