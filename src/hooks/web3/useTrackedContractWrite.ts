import { useTransactionTracker } from '@/providers/TransactionsProvider'
import { isLoadingForTransactionStatus } from '@/types/web3/transactions'
import { Abi, Address } from 'abitype'
import { useState } from 'react'
import { ContractFunctionArgs, ContractFunctionName, Hash } from 'viem'
import { useWriteContract } from 'wagmi'

export default function useTrackedContractWrite<
    TAbi extends Abi,
    TAbiStateMutability extends 'nonpayable' | 'payable',
    TFunctionName extends ContractFunctionName<TAbi, TAbiStateMutability>
>(config: { address: Address, abi: TAbi, functionName: TFunctionName }) {
    const { trackTransaction, useTrackedTransactionStatus } = useTransactionTracker()
    const writeContract = useWriteContract()

    const [transactionId, setTransactionId] = useState<string | undefined>(undefined)
    const status = useTrackedTransactionStatus(transactionId)

    // TODO: do we still need to use retry?
    // await retry(async () => await publicClient.getTransaction({ hash }))

    type Inputs = ContractFunctionArgs<TAbi, TAbiStateMutability, TFunctionName>
    type Variables = Parameters<typeof writeContract.writeContractAsync>[0]
    type VarsPayable = Extract<Variables, { value: bigint }>
    type VarsNonpayable = Exclude<Variables, { value: bigint }>
    type Options = TAbiStateMutability extends 'payable' ? { value: bigint } : never

    const write = async (args: Inputs, notificationTitle: string, options: Options) => {
        let transaction: ReturnType<typeof writeContract.writeContractAsync>
        if ('value' in options) {
            const vars: Variables = {
                args: args as readonly unknown[],
                value: options.value,
                ...config
            } as VarsPayable
            transaction = writeContract.writeContractAsync(vars)
        } else {
            const vars: Variables = {
                args: args as readonly unknown[],
                ...config
            } as VarsNonpayable
            transaction = writeContract.writeContractAsync(vars)
        }

        setTransactionId(trackTransaction(transaction, notificationTitle))
        try {
            return await transaction
        } catch {
            // The tracker already classified the throw: a wallet rejection
            // (viem UserRejectedRequestError / EIP-1193 code 4001) surfaces as
            // status `cancelled` with "Cancelled in wallet"; anything else as
            // `reverted`. See TransactionManager.isUserRejection.
            return { hash: '0x0' } as { hash: Hash }
        }
    }
    
    return {
        ...writeContract,
        write: (args: Inputs, notificationTitle: string, options: Options = {} as Options) => {
            write(args, notificationTitle, options)
        },
        writeAsync: async (args: Inputs, notificationTitle: string, options: Options = {} as Options) => {
            return write(args, notificationTitle, options)
        },
        status,
        isLoading: status && isLoadingForTransactionStatus(status)
    }
}