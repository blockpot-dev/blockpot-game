export type TransactionStatus = 'success' | 'reverted' | 'cancelled' | 'userPrompt' | 'pending'
export function messageForTransactionStatus(status: TransactionStatus) {
    switch (status) {
    case 'success': return 'Success'
    case 'reverted': return 'Reverted'
    case 'cancelled': return 'Cancelled'
    case 'userPrompt': return 'Waiting...'
    case 'pending': return 'Pending...'
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