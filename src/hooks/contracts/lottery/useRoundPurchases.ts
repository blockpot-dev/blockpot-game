import { useQuery, useQueryClient } from '@tanstack/react-query'
import useRoundEntryIndexes from './useRoundEntryIndexes'
import { PurchaseData } from '@/types/lottery/purchase'
import useLotteryRead from '../read/useLotteryRead'
import { useAccount } from 'wagmi'
import { ZERO_ADDRESS } from '@/web3/constants'
import { Address } from 'viem'

type RawPurchaseData = {
    beneficiary: Address
    entryStart: number
    amount: number
    payoutInWeth: boolean
}

function createPurchaseData(id: number, rawPurchaseData: RawPurchaseData): PurchaseData {
    const entryEnd = rawPurchaseData.entryStart + rawPurchaseData.amount - 1
    if (rawPurchaseData.entryStart === entryEnd) {
        return {
            id,
            type: 'single',
            number: Number(rawPurchaseData.entryStart)
        }
    } else {
        return {
            id,
            type: 'multiple',
            numberStart: Number(rawPurchaseData.entryStart),
            numberEnd: Number(entryEnd)
        }
    }
}

export type RoundPurchasesData = {
    purchases: {[id: string]: PurchaseData}
    totalTickets: number
}
export default function useRoundPurchases(roundIndex: number) {
    const { game, selectedGame } = useLotteryRead()
    const roundEntryIndexes = useRoundEntryIndexes(roundIndex)
    const { address } = useAccount()
    const client = useQueryClient()

    const { data } = useQuery({
        queryKey: ['roundPurchases', selectedGame, address ?? ZERO_ADDRESS, roundIndex.toString()],
        queryFn: async () => {
            const purchases: PurchaseData[] = await Promise.all(roundEntryIndexes.map(async (purchaseIndex: number) => {
                const data: RawPurchaseData = await client.fetchQuery({
                    queryKey: ['roundPurchase', selectedGame, roundIndex.toString(), purchaseIndex.toString()],
                    queryFn: async () => {
                        return await game.getEntry([purchaseIndex, Number(roundIndex)])
                    }
                })
                return createPurchaseData(purchaseIndex, data)
            }))
            const totalTickets = purchases.reduce((acc, purchase) => {
                if (purchase.type === 'single') {
                    return acc + 1
                } else {
                    return acc + ((purchase.numberEnd - purchase.numberStart) + 1)
                }
            }, 0)

            return {
                purchases: purchases.reduce((acc, purchase) => {
                    acc[purchase.id.toString()] = purchase
                    return acc
                }, {} as {[id: string]: PurchaseData}),
                totalTickets
            }
        },
        enabled: !!address && roundIndex !== -1 
    })

    return data ?? {
        purchases: {},
        totalTickets: 0
    }
}