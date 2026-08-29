import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useChainId, usePublicClient } from 'wagmi'
import { Hash, PublicClient, Transaction } from 'viem'
import TransactionManager from '@/web3/TransactionManager'
import { v4 as uuidv4 } from 'uuid'
import { TransactionStatus, canCloseForTransactionStatus, messageForTransactionStatus } from '@/types/web3/transactions'
import { toast } from 'sonner'

const TRANSACTIONS_STORAGE_KEY = 'transactions'
const TRANSACTION_DETAILS_STORAGE_KEY = 'transactionDetails'

const transactionManager = new TransactionManager()

export type TransactionDetails = {
  hash: string,
  title: string,
  timestamp: number
}
export type TransactionDetailsMap = { [key: string]: TransactionDetails }

type TrackedTransactionStatusMap = {[id: string]: {status: TransactionStatus}}

export type TransactionsContextType = {
  transactionsVisible: boolean,
  setTransactionsVisible: (visible: boolean) => void,
  addTransaction: (transaction: Transaction, title: string, message?: string) => void,
  transactions: {
    orderedTransactionHashes: string[],
    transactionDetails: TransactionDetailsMap
  },
  startTransaction: (uuid: string, title: string, message?: string) => void,
  updateTransaction: (uuid: string, title: string, status: TransactionStatus) => void,

  trackTransaction: (transaction: Promise<Hash>, title: string) => string,
  useTrackedTransactionStatus: (id: string | undefined) => TransactionStatus | undefined
}

const TransactionsContext = createContext<TransactionsContextType>(
    {
        transactionsVisible: false,
        setTransactionsVisible: () => { },
        addTransaction: () => { },
        transactions: {
            orderedTransactionHashes: [],
            transactionDetails: {}
        },
        startTransaction: () => {},
        updateTransaction: () => {},
        trackTransaction: () => '',
        useTrackedTransactionStatus: () => undefined
    })

export default function TransactionsProvider(props: { children: ReactNode }) {
    const chainId = useChainId()
    const publicClient = usePublicClient() as PublicClient
    const [transactions, setTransactions] = useState<string[]>([])
    const [trackedTransactions, setTrackedTransactions] = useState<TrackedTransactionStatusMap>({})
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetailsMap>({})
    const [transactionsVisible, setTransactionsVisible] = useState(false) 
    const transactionsStorageKey = `${TRANSACTIONS_STORAGE_KEY}-${chainId}`
    const transactionDetailsStorageKey = `${TRANSACTION_DETAILS_STORAGE_KEY}-${chainId}`

    const addTransactionDetails = (transactionDetails: TransactionDetails) => {
        setTransactions((p) => {
            p.unshift(transactionDetails.hash)
            localStorage.setItem(transactionsStorageKey, JSON.stringify(p, null, 0))
            return p
        })
        setTransactionDetails((p) => {
            p[transactionDetails.hash] = transactionDetails
            localStorage.setItem(transactionDetailsStorageKey, JSON.stringify(p, null, 0))
            return p
        })
    }

    const updateTransactionDetails = (transactionDetails: { hash: string } & Partial<TransactionDetails>) => {
        setTransactionDetails((p) => {
            const existingDetails = p[transactionDetails.hash]
            if (existingDetails) {
                p[transactionDetails.hash] = {
                    ...existingDetails,
                    ...transactionDetails
                }
                localStorage.setItem(transactionDetailsStorageKey, JSON.stringify(p, null, 0))
            }
            return p
        })
    }

    const waitForTransaction = async (transaction: Transaction, title: string, message?: string) => {
        try {
            
            const receipt = await publicClient.waitForTransactionReceipt({hash: transaction.hash, confirmations: 1})
            toast.success(title, {
                id: transaction.hash,
                description: message ?? messageForTransactionStatus('success')
            })
            updateTransactionDetails({
                hash: transaction.hash,
                timestamp: Number((await publicClient.getBlock({ blockNumber: receipt.blockNumber })).timestamp * 1000n)
            })
        } catch {
            toast.error(title, {
                id: transaction.hash,
                description: message ?? messageForTransactionStatus('reverted')
            })
        }
    }

    const addTransaction = (transaction: Transaction, title: string, message?: string) => {
        toast.loading(title, {
            id: transaction.hash,
            description: message ?? messageForTransactionStatus('pending')
        })
        waitForTransaction(transaction, title, message)
        addTransactionDetails({
            hash: transaction.hash,
            title,
            timestamp: Date.now()
        })
    }

    const startTransaction = useCallback((id: string, title: string, message?: string) => {
        toast.loading(title, {
            id: id,
            description: message ?? messageForTransactionStatus('userPrompt')
        })
    }, [])

    
    const updateTransaction = useCallback((id: string, title: string, status: TransactionStatus) => {
        const canClose = canCloseForTransactionStatus(status)
        if (canClose) {
            if (status === 'success') {
                toast.success(title, {
                    id: id,
                    description: messageForTransactionStatus(status)
                })
            } else {
                toast.error(title, {
                    id: id,
                    description: messageForTransactionStatus(status)
                })
            }
        } else {
            toast.loading(title, {
                id: id,
                description: messageForTransactionStatus(status)
            })
        }
    }, [])

    const trackTransaction = (transaction: Promise<Hash>, title: string) => {
        const id = uuidv4()
        transactionManager.trackTransaction(id, transaction, title, (status: TransactionStatus) => {
            setTrackedTransactions((trackedTransactions) => ({
                ...trackedTransactions,
                [id]: { status}
            }))
        })
        return id
    }

    const useTrackedTransactionStatus = (id: string | undefined) => id ? trackedTransactions[id].status : undefined

    // load from storage
    useEffect(() => {
        const storedTransactionsJSON = localStorage.getItem(transactionsStorageKey)
        if (storedTransactionsJSON) {
            const storedTransactions: string[] = JSON.parse(storedTransactionsJSON)
            setTransactions(storedTransactions)
        } else {
            setTransactions([])
        }

        const storedTransactionDetailsJSON = localStorage.getItem(transactionDetailsStorageKey)
        if (storedTransactionDetailsJSON) {
            const storedTransactionDetails: TransactionDetailsMap = JSON.parse(storedTransactionDetailsJSON)
            setTransactionDetails(storedTransactionDetails)
        } else {
            setTransactionDetails({})
        }
    }, [chainId, transactionsStorageKey, transactionDetailsStorageKey])

    // transaction manager sync
    useEffect(() => {
        if (!transactionManager.initialized) {
            transactionManager.initialize(publicClient, (id, status, title) => {
                if (status === 'userPrompt') {
                    startTransaction(id, title, messageForTransactionStatus(status))
                } else {
                    updateTransaction(id, title, status)
                }
            })
        }
    }, [publicClient, startTransaction, updateTransaction])

    const value = {
        transactionsVisible,
        setTransactionsVisible,
        addTransaction,
        transactions: {
            orderedTransactionHashes: transactions,
            transactionDetails
        },
        startTransaction,
        updateTransaction,
        trackTransaction,
        useTrackedTransactionStatus
    }

    return (
        <TransactionsContext.Provider value={value}>
            {props.children}
        </TransactionsContext.Provider>
    )
}

export const useTransactionsDialog = () => {
    return useContext(TransactionsContext)
}

export const useTransactions = () => {
    const { addTransaction, startTransaction, updateTransaction } = useContext(TransactionsContext)
    return {
        addTransaction,
        startTransaction,
        updateTransaction
    }
}

export const useTransactionTracker = () => {
    const { trackTransaction, useTrackedTransactionStatus } = useContext(TransactionsContext)
    return {
        trackTransaction,
        useTrackedTransactionStatus
    }
}

export const useTransactionHistory = () => {
    const { transactions } = useContext(TransactionsContext)
    return {
        transactions
    }
}