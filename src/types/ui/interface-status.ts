import { TransactionStatus } from '@/types/web3/transactions'
import { QueryStatus } from '@tanstack/react-query'

export type InterfaceStatus = 'idle' | 'pending' | 'success' | 'error'

export function transactionStatusToInterfaceStatus(status: TransactionStatus | undefined): InterfaceStatus {
    switch (status) {
    case 'success': return 'success'
    case 'reverted': return 'error'
    case 'cancelled': return 'error'
    case 'userPrompt': return 'pending'
    case 'pending': return 'pending'
    default: return 'idle'
    }
}

export function queryStatusToInterfaceStatus(status: QueryStatus | undefined): InterfaceStatus {
    switch (status) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'pending': return 'pending'
    default: return 'idle'
    }
}