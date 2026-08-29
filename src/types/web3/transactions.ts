export type TransactionStatus = 'success' | 'reverted' | 'cancelled' | 'userPrompt' | 'pending'
export function messageForTransactionStatus(status: TransactionStatus) {
    switch (status) {
    case 'success': return 'Confirmed on-chain'
    case 'reverted': return 'Transaction failed on-chain — nothing was charged beyond gas'
    case 'cancelled': return 'Cancelled in wallet'
    case 'userPrompt': return 'Confirm in your wallet…'
    case 'pending': return 'Confirming on-chain…'
    }
}

export function colorForTransactionStatus(status: TransactionStatus): string {
    switch (status) {
    case 'success': return 'green-600'
    case 'reverted': return 'red-600'
    case 'cancelled': return 'red-600'
    case 'userPrompt': return 'yellow-600'
    case 'pending': return 'blue-600'
    }
}

export function canCloseForTransactionStatus(status: TransactionStatus) {
    switch (status) {
    case 'success': return true
    case 'reverted': return true
    case 'cancelled': return true
    case 'userPrompt': return false
    case 'pending': return false
    }
}

export function isLoadingForTransactionStatus(status: TransactionStatus) {
    switch (status) {
    case 'success': return false
    case 'reverted': return false
    case 'cancelled': return false
    case 'userPrompt': return true
    case 'pending': return true
    }
}