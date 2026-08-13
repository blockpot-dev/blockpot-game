import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Address } from 'viem'
import { ZERO_ADDRESS } from '@/web3/constants'
import {
    clearIdentityCache,
    EXPECTED_IDENTITY,
    verifyContractIdentity,
    type ExpectedIdentity,
} from './contract-identity'
import { ContractName } from '@/constants/contract-addresses'

const ADDR = '0x0000000000000000000000000000000000000B01' as Address
const EXPECTED: ExpectedIdentity = { type: 'KYCRegistry', majorVersion: 1 }

type ClientStub = {
    getCode: ReturnType<typeof vi.fn>
    readContract: ReturnType<typeof vi.fn>
    chain?: { id: number }
}

function clientWith({ code, identity, revert }: { code?: string, identity?: string, revert?: boolean }): ClientStub {
    return {
        chain: { id: 31337 },
        getCode: vi.fn().mockResolvedValue(code ?? '0x6080'),
        readContract: revert
            ? vi.fn().mockRejectedValue(new Error('execution reverted'))
            : vi.fn().mockResolvedValue(identity),
    }
}

describe('verifyContractIdentity', () => {
    beforeEach(() => {
        clearIdentityCache()
    })

    it('returns ok when the identity matches type and major version', async () => {
        const client = clientWith({ identity: 'KYCRegistry 1.0.0' })
        const status = await verifyContractIdentity(client as never, ADDR, EXPECTED)
        expect(status).toEqual({ kind: 'ok', type: 'KYCRegistry', version: '1.0.0' })
    })

    it('returns no-code when the address has no bytecode', async () => {
        const client = clientWith({ code: undefined })
        client.getCode.mockResolvedValue(undefined)
        const status = await verifyContractIdentity(client as never, ADDR, EXPECTED)
        expect(status).toEqual({ kind: 'no-code' })
        expect(client.readContract).not.toHaveBeenCalled()
    })

    it('returns no-code for the ZERO_ADDRESS fallback without any RPC call', async () => {
        const client = clientWith({ identity: 'KYCRegistry 1.0.0' })
        const status = await verifyContractIdentity(client as never, ZERO_ADDRESS as Address, EXPECTED)
        expect(status).toEqual({ kind: 'no-code' })
        expect(client.getCode).not.toHaveBeenCalled()
        expect(client.readContract).not.toHaveBeenCalled()
    })

    it('returns not-identifiable when typeAndVersion() reverts on a live contract', async () => {
        const client = clientWith({ revert: true })
        const status = await verifyContractIdentity(client as never, ADDR, EXPECTED)
        expect(status).toEqual({ kind: 'not-identifiable' })
    })

    it('returns type-mismatch with the found identity when another contract answers', async () => {
        const client = clientWith({ identity: 'Lottery 1.0.0' })
        const status = await verifyContractIdentity(client as never, ADDR, EXPECTED)
        expect(status).toEqual({ kind: 'type-mismatch', found: 'Lottery 1.0.0' })
    })

    it('returns version-mismatch when the type matches but the major version differs', async () => {
        const client = clientWith({ identity: 'KYCRegistry 2.0.0' })
        const status = await verifyContractIdentity(client as never, ADDR, EXPECTED)
        expect(status).toEqual({ kind: 'version-mismatch', found: 'KYCRegistry 2.0.0' })
    })

    it('caches the verdict per (chainId, address) and does not re-probe', async () => {
        const client = clientWith({ identity: 'KYCRegistry 1.0.0' })
        await verifyContractIdentity(client as never, ADDR, EXPECTED)
        await verifyContractIdentity(client as never, ADDR, EXPECTED)
        expect(client.readContract).toHaveBeenCalledTimes(1)
    })
})

describe('EXPECTED_IDENTITY', () => {
    it('skips third-party contracts (aggregators, WETH) with null', () => {
        expect(EXPECTED_IDENTITY[ContractName.CHAINLINK_AGGREGATOR_V3]).toBeNull()
        expect(EXPECTED_IDENTITY[ContractName.CHAINLINK_AGGREGATOR_EUR_USD]).toBeNull()
        expect(EXPECTED_IDENTITY[ContractName.WETH]).toBeNull()
    })

    it('covers every first-party contract with its Solidity type name', () => {
        expect(EXPECTED_IDENTITY[ContractName.KYC_REGISTRY]).toEqual({ type: 'KYCRegistry', majorVersion: 1 })
        expect(EXPECTED_IDENTITY[ContractName.LGO]).toEqual({ type: 'LGO', majorVersion: 1 })
        expect(EXPECTED_IDENTITY[ContractName.PLAYER_REGISTRY]).toEqual({ type: 'PlayerRegistry', majorVersion: 1 })
        expect(EXPECTED_IDENTITY[ContractName.LOTTERY_MAIN]).toEqual({ type: 'Lottery', majorVersion: 1 })
        expect(EXPECTED_IDENTITY[ContractName.QUICK_GAME]).toEqual({ type: 'Lottery', majorVersion: 1 })
        expect(EXPECTED_IDENTITY[ContractName.FUNDS_MANAGER_MAIN]).toEqual({ type: 'UnipotFundsManager', majorVersion: 1 })
        expect(EXPECTED_IDENTITY[ContractName.COMPLIANCE_REGISTRY]).toEqual({ type: 'ComplianceRegistry', majorVersion: 1 })
    })
})
