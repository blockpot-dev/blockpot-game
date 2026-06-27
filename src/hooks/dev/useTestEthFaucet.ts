import { useMutation } from '@tanstack/react-query'
import { authedFetch } from '@/api/gamingServiceClient'

export type TestEthFaucetResult = {
    txHash: string
    beneficiary: string
    amount: string
}

export default function useTestEthFaucet() {
    return useMutation<TestEthFaucetResult>({
        mutationFn: async () => {
            return authedFetch<TestEthFaucetResult>('/v1/faucet/request', {
                method: 'POST',
                body: {},
            })
        },
    })
}
