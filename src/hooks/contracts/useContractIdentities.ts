import { useEffect, useState } from 'react'
import { useChainId } from 'wagmi'
import { toast } from 'sonner'
import { Address } from 'viem'
import useAvailablePublicClient from '@/hooks/web3/useAvailablePublicClient'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'
import { ZERO_ADDRESS } from '@/web3/constants'
import {
    ContractIdentityStatus,
    EXPECTED_IDENTITY,
    verifyContractIdentity,
} from '@/lib/contract-identity'

export interface ContractIdentityReport {
    name: string
    expected: { type: string, majorVersion: number }
    address: Address
    status: ContractIdentityStatus
}

// Surfaced findings are deduped per session: the verifier's (chainId, address)
// cache means each pair is probed once, and this set keeps a re-mount of the
// hook from re-toasting verdicts the cache already returned.
const surfaced = new Set<string>()

function describe(
    expected: { type: string, majorVersion: number },
    address: Address,
    chainId: number,
    status: ContractIdentityStatus,
): string | null {
    switch (status.kind) {
    case 'ok':
        return null
    case 'no-code':
        // A zero address means "not configured/deployed on this chain yet" (e.g. the
        // ReferralManager pre-deploy) — a report worth listing, never a toast-worthy fault.
        if (address === ZERO_ADDRESS) return null
        return `No contract at ${address} on chain ${chainId} (expected ${expected.type}). The configured address is stale or wrong.`
    case 'not-identifiable':
        return `Contract at ${address} on chain ${chainId} does not answer typeAndVersion() (expected ${expected.type}). It is either a third-party contract or predates task 115.`
    case 'type-mismatch':
        return `Expected ${expected.type} at ${address} on chain ${chainId} — found ${status.found}.`
    case 'version-mismatch':
        return `${expected.type} at ${address} on chain ${chainId} reports ${status.found}; this build expects major version ${expected.majorVersion}.`
    }
}

// Probes every configured first-party contract for the active chain once per
// session and soft-surfaces mismatches: console.table diagnostics plus a
// sonner toast per finding (error for wrong/unidentifiable/missing contracts,
// warning for version drift). Reads never block on the verdict.
export default function useContractIdentities() {
    const chainId = useChainId()
    const client = useAvailablePublicClient()
    const [statuses, setStatuses] = useState<ContractIdentityReport[]>([])

    useEffect(() => {
        let cancelled = false

        async function probe() {
            const reports: ContractIdentityReport[] = []
            for (const [key, expected] of Object.entries(EXPECTED_IDENTITY)) {
                if (!expected) continue
                const name = ContractName[Number(key)]
                const address = getContractAddress(chainId, Number(key) as ContractName)
                const status = await verifyContractIdentity(client, address, expected)
                reports.push({ name, expected, address, status })
            }
            if (cancelled) return

            const findings = reports.filter((r) => r.status.kind !== 'ok')
            if (findings.length > 0) {
                console.error(`[contract-identity] ${findings.length} contract identity finding(s) on chain ${chainId}`)
                console.table(reports.map((r) => ({
                    contract: r.name,
                    address: r.address,
                    verdict: r.status.kind,
                    found: 'found' in r.status ? r.status.found : ('version' in r.status ? `${r.status.type} ${r.status.version}` : '—'),
                })))
            }
            for (const r of findings) {
                const dedupeKey = `${chainId}:${r.address}:${r.status.kind}`
                if (surfaced.has(dedupeKey)) continue
                surfaced.add(dedupeKey)
                const message = describe(r.expected, r.address, chainId, r.status)
                if (!message) continue
                if (r.status.kind === 'version-mismatch') {
                    toast.warning(message)
                } else {
                    toast.error(message)
                }
            }
            setStatuses(reports)
        }

        void probe()
        return () => { cancelled = true }
    }, [chainId, client])

    return { statuses }
}
