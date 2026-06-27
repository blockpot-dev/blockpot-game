import { Abi } from 'abitype'
import { useState } from 'react'
import { Address, ContractEventName } from 'viem'
import { useWatchContractEvent } from 'wagmi'

export default function useEventBlockNumber<TAbi extends Abi>(options: {address: Address, abi: TAbi, events: ContractEventName<TAbi>[]}) {
    const [lastBlockNumber, setLastBlockNumber] = useState(-1n)
    for (let i = 0; i < options.events.length; i++) {
        const eventName = options.events[i]
        // This is guaranteed to be called in the same order each time
         
        useWatchContractEvent({
            address: options.address,
            abi: options.abi,
            eventName,
            onLogs: (logs) => {
                const blockNumber = logs[logs.length - 1].blockNumber
                if (blockNumber) {
                    setLastBlockNumber(blockNumber)
                }
            }
        })
    }
    return lastBlockNumber
}