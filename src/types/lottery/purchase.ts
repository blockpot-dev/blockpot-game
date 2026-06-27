export type PurchaseData = 
{
    id: number
} &
({
    type: 'single'
    number: number
} | {
    type: 'multiple'
    numberStart: number
    numberEnd: number
})