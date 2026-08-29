import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { UserRejectedRequestError } from 'viem'
import TransactionsProvider, { useTransactionTracker } from './TransactionsProvider'

const toastMock = vi.hoisted(() => ({
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: toastMock }))

const publicClientMock = vi.hoisted(() => ({
    waitForTransactionReceipt: vi.fn(),
    getBlock: vi.fn(),
    getTransaction: vi.fn(),
    call: vi.fn(),
}))
vi.mock('wagmi', () => ({
    useChainId: () => 31337,
    usePublicClient: () => publicClientMock,
}))

type Tracker = ReturnType<typeof useTransactionTracker>
function Probe(props: { onReady: (tracker: Tracker) => void }) {
    props.onReady(useTransactionTracker())
    return null
}
const captured: Tracker[] = []
const tracker = () => captured[captured.length - 1]

const flush = async () => {
    await act(async () => {
        await new Promise((r) => setTimeout(r, 0))
    })
}

const HASH = `0x${'ab'.repeat(32)}` as const

// happy-dom does not expose localStorage on the vitest global; the provider
// only uses it to persist history, which these tests do not assert on.
const storage = new Map<string, string>()
vi.stubGlobal('localStorage', {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => { storage.set(k, v) },
    removeItem: (k: string) => { storage.delete(k) },
})

describe('TransactionsProvider toast copy', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        render(
            <TransactionsProvider>
                <Probe onReady={(t) => captured.push(t)} />
            </TransactionsProvider>,
        )
    })

    it('asks the player to confirm in their wallet while prompting', async () => {
        const never = new Promise<typeof HASH>(() => {})
        act(() => { tracker().trackTransaction(never, 'Enter draw') })
        await flush()
        expect(toastMock.loading).toHaveBeenCalledWith('Enter draw', expect.objectContaining({
            description: 'Confirm in your wallet…',
        }))
    })

    it('toasts "Cancelled in wallet" when the player rejects the write', async () => {
        const rejected = Promise.reject(new UserRejectedRequestError(new Error('User rejected')))
        act(() => { tracker().trackTransaction(rejected, 'Enter draw') })
        await flush()
        expect(toastMock.error).toHaveBeenCalledWith('Enter draw', expect.objectContaining({
            description: 'Cancelled in wallet',
        }))
    })

    it('toasts "Transaction failed on-chain" when the receipt reverts', async () => {
        publicClientMock.waitForTransactionReceipt.mockResolvedValue({ status: 'reverted', blockNumber: 1n })
        publicClientMock.getTransaction.mockRejectedValue(new Error('no debug'))
        act(() => { tracker().trackTransaction(Promise.resolve(HASH), 'Enter draw') })
        await flush()
        await flush()
        expect(toastMock.loading).toHaveBeenCalledWith('Enter draw', expect.objectContaining({
            description: 'Confirming on-chain…',
        }))
        expect(toastMock.error).toHaveBeenCalledWith('Enter draw', expect.objectContaining({
            description: 'Transaction failed on-chain — nothing was charged beyond gas',
        }))
    })

    it('toasts "Confirmed on-chain" on success', async () => {
        publicClientMock.waitForTransactionReceipt.mockResolvedValue({ status: 'success', blockNumber: 1n })
        act(() => { tracker().trackTransaction(Promise.resolve(HASH), 'Enter draw') })
        await flush()
        await flush()
        expect(toastMock.success).toHaveBeenCalledWith('Enter draw', expect.objectContaining({
            description: 'Confirmed on-chain',
        }))
    })

    it('never ends a toast body in "!" or "..."', async () => {
        publicClientMock.waitForTransactionReceipt.mockResolvedValue({ status: 'success', blockNumber: 1n })
        act(() => { tracker().trackTransaction(Promise.resolve(HASH), 'Enter draw') })
        await flush()
        await flush()
        const bodies = [...toastMock.loading.mock.calls, ...toastMock.success.mock.calls, ...toastMock.error.mock.calls]
            .map(([, opts]) => (opts as { description: string }).description)
        expect(bodies.length).toBeGreaterThan(0)
        for (const body of bodies) {
            expect(body).not.toMatch(/(!|\.\.\.)$/)
        }
    })
})
