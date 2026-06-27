import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export default function useAccountConnected() {
    const [isConnected, setIsConnected] = useState(false)
    const { address, isConnected: _isConnected } = useAccount()

    useEffect(() => {
        if (_isConnected) {
            setIsConnected(true)
        } else {
            setIsConnected(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address])

    return isConnected
}