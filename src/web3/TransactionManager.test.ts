import { describe, expect, it, vi } from 'vitest'
import TransactionManager from './TransactionManager'
import type { PublicClient } from 'viem'
import { UserRejectedRequestError } from 'viem'

// BLO-734: a contract revert thrown from writeContract (simulation /
// estimateGas failure) must surface as 'reverted', not 'cancelled' —
// 'cancelled' is reserved for the user rejecting in the wallet.

function track(rejection: unknown) {
    const statuses: string[] = []
    const tm = new TransactionManager()
    tm.initialize({} as PublicClient, (_id, status) => { statuses.push(status) })
    const done = tm.trackTransaction('id', Promise.reject(rejection), 'title', () => {})
    return done.then(() => statuses)
}

describe('TransactionManager write-throw classification', () => {
    it('user rejection in the wallet → cancelled', async () => {
        const err = new UserRejectedRequestError(new Error('User rejected the request.'))
        expect(await track(err)).toEqual(['userPrompt', 'cancelled'])
    })

    it('nested user rejection (wrapped by a wallet connector) → cancelled', async () => {
        const inner = new UserRejectedRequestError(new Error('User rejected the request.'))
        const wrapped = new Error('request failed')
        ;(wrapped as Error & { cause: unknown }).cause = inner
        expect(await track(wrapped)).toEqual(['userPrompt', 'cancelled'])
    })

    it('contract revert thrown before a hash exists → reverted', async () => {
        const revert = new Error('execution reverted: NotActivePlayer()')
        expect(await track(revert)).toEqual(['userPrompt', 'reverted'])
    })

    it('vi sanity: statusSync mirrors updateHandler', async () => {
        const sync = vi.fn()
        const tm = new TransactionManager()
        tm.initialize({} as PublicClient, () => {})
        await tm.trackTransaction('id', Promise.reject(new Error('boom')), 't', sync)
        expect(sync).toHaveBeenLastCalledWith('reverted')
    })
})
