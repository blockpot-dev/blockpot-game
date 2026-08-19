import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Address } from 'viem'
import { clearIdentityCache, EXPECTED_IDENTITY } from '@/lib/contract-identity'
import { ContractName, getContractAddress } from '@/constants/contract-addresses'

const readContractMock = vi.fn()
const getCodeMock = vi.fn()
const clientMock = { chain: { id: 31337 }, getCode: getCodeMock, readContract: readContractMock }

vi.mock('@/hooks/web3/useAvailablePublicClient', () => ({
    default: () => clientMock,
}))
vi.mock('wagmi', async () => {
    const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
    return { ...actual, useChainId: () => 31337 }
})

const toastErrorMock = vi.fn()
const toastWarningMock = vi.fn()
vi.mock('sonner', () => ({
    toast: {
        error: (...a: unknown[]) => toastErrorMock(...a),
        warning: (...a: unknown[]) => toastWarningMock(...a),
    },
}))

import useContractIdentities from './useContractIdentities'

const FIRST_PARTY_COUNT = Object.values(EXPECTED_IDENTITY).filter(Boolean).length
const CONFIGURED_FIRST_PARTY = Object.entries(EXPECTED_IDENTITY)
    .filter(([, expected]) => expected !== null)
    .map(([name]) => getContractAddress(31337, Number(name) as ContractName))
    .filter((addr: Address) => addr !== '0x0000000000000000000000000000000000000000')

describe('useContractIdentities', () => {
    beforeEach(() => {
        clearIdentityCache()
        vi.clearAllMocks()
        getCodeMock.mockResolvedValue('0x6080')
    })

    it('probes each configured first-party contract once and reports ok silently', async () => {
        readContractMock.mockImplementation(async ({ address }: { address: Address }) => {
            const entry = Object.entries(EXPECTED_IDENTITY).find(([name, expected]) =>
                expected !== null && getContractAddress(31337, Number(name) as ContractName) === address)
            return `${entry![1]!.type} 1.0.0`
        })

        const { result } = renderHook(() => useContractIdentities())
        await waitFor(() => expect(result.current.statuses.length).toBe(FIRST_PARTY_COUNT))

        // Only configured (non-zero) addresses hit the RPC; zero-address entries
        // classify as no-code without a call.
        expect(readContractMock).toHaveBeenCalledTimes(CONFIGURED_FIRST_PARTY.length)
        expect(toastErrorMock).not.toHaveBeenCalled()
        expect(toastWarningMock).not.toHaveBeenCalled()
    })

    it('does not re-probe on re-render (session cache)', async () => {
        readContractMock.mockResolvedValue('KYCRegistry 1.0.0')
        const { result, rerender } = renderHook(() => useContractIdentities())
        await waitFor(() => expect(result.current.statuses.length).toBe(FIRST_PARTY_COUNT))
        const calls = readContractMock.mock.calls.length
        rerender()
        await waitFor(() => expect(result.current.statuses.length).toBe(FIRST_PARTY_COUNT))
        expect(readContractMock.mock.calls.length).toBe(calls)
    })

    it('surfaces a type mismatch as an error toast naming expected and found', async () => {
        readContractMock.mockResolvedValue('UnipotDraw 1.0.0')
        const { result } = renderHook(() => useContractIdentities())
        await waitFor(() => expect(result.current.statuses.length).toBe(FIRST_PARTY_COUNT))

        await waitFor(() => expect(toastErrorMock).toHaveBeenCalled())
        const messages = toastErrorMock.mock.calls.map((c) => String(c[0]))
        expect(messages.some((m) => m.includes('KYCRegistry') && m.includes('UnipotDraw 1.0.0'))).toBe(true)
    })

    it('surfaces version drift as a warning toast, not an error', async () => {
        readContractMock.mockImplementation(async ({ address }: { address: Address }) => {
            const entry = Object.entries(EXPECTED_IDENTITY).find(([name, expected]) =>
                expected !== null && getContractAddress(31337, Number(name) as ContractName) === address)
            return `${entry![1]!.type} 2.0.0`
        })
        const { result } = renderHook(() => useContractIdentities())
        await waitFor(() => expect(result.current.statuses.length).toBe(FIRST_PARTY_COUNT))

        await waitFor(() => expect(toastWarningMock).toHaveBeenCalled())
        expect(toastErrorMock).not.toHaveBeenCalled()
    })
})
