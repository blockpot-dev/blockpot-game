import { usePrevious } from '@/hooks/utilities/usePrevious'
import { useChainId } from 'wagmi'

export default function useChainChanged() {
    const chainId = useChainId()
    const previousChainId = usePrevious(chainId)
    return (previousChainId !== undefined) && (previousChainId !== chainId)
}