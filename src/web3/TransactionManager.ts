import { drawAbi } from '@/abi/drawAbi'
import { TransactionStatus } from '@/types/web3/transactions'
import { decodeErrorResult, Hash, PublicClient, UserRejectedRequestError } from 'viem'

async function debugTransaction(publicClient: PublicClient, hash: Hash) {
    const tx = await publicClient.getTransaction({ hash })
    console.log('tx', tx)
    try {
        await publicClient.call({
            account: tx.from,
            to: tx.to!,
            data: tx.input,
            value: tx.value,
            gas: tx.gas,
        })
        return null
    } catch (err) {
        console.log('revert simulation error', err)
        const e = err as { cause?: { data?: `0x${string}` }, data?: `0x${string}` }
        const data = e?.cause?.data || e?.data
        if (!data) {
            console.warn('No revert data found in error; revert reason could not be decoded')
            return null
        }
        try {
            return decodeErrorResult({ abi: drawAbi, data })
        } catch (decodeErr) {
            console.warn('Could not decode revert data against drawAbi', { data, decodeErr })
            return null
        }
    }
}


// Walks the error's cause chain looking for viem's UserRejectedRequestError
// (EIP-1193 code 4001) — wallet connectors often wrap it.
export function isUserRejection(error: unknown): boolean {
    let e = error
    while (e instanceof Error) {
        if (e instanceof UserRejectedRequestError) return true
        if ((e as Error & { code?: number }).code === 4001) return true
        e = e.cause
    }
    return false
}

export default class TransactionManager {
    initialized: boolean = false
    updateHandler: (id: string, status: TransactionStatus, title: string) => void = () => { }
    publicClient: PublicClient | undefined

    initialize(publicClient: PublicClient, updateHandler: (id: string, status: TransactionStatus, title: string) => void) {
        this.updateHandler = updateHandler
        this.publicClient = publicClient
    }

    async trackTransaction(id: string, transaction: Promise<Hash>, title: string, statusSync: (status: TransactionStatus) => void) {
        if (!this.publicClient) { return }
        try {
            this.updateHandler(id, 'userPrompt', title)
            statusSync('userPrompt')

            const hash = await transaction
            this.updateHandler(id, 'pending', title)
            statusSync('pending')
            try {
                const publicClient = this.publicClient
                
                const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 })

                // TODO: Delete me
                if (receipt.status === 'reverted') {
                    const decoded = await debugTransaction(publicClient, hash)
                    console.log('decoded', decoded)
                }

                this.updateHandler(id, receipt.status, title)
                statusSync(receipt.status)
            } catch (error) {
                console.log('error', error)
                this.updateHandler(id, 'reverted', title)
                statusSync('reverted')
            }
        } catch (error) {
            // A throw before we have a hash is either the user rejecting in
            // the wallet or the write failing upfront (simulation /
            // estimateGas revert). Only the former is a cancellation —
            // presenting a revert as "Cancelled" hides the real failure
            // (BLO-734).
            const status = isUserRejection(error) ? 'cancelled' : 'reverted'
            this.updateHandler(id, status, title)
            statusSync(status)
        }
    }
}