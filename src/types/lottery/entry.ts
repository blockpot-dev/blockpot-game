export type EntryAmount = {
    type: 'fixed'
    amount: number
} | {
    type: 'custom'
    amount: number
    stringValue: string
}