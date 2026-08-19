import { lotteryAbi } from '@/abi/lotteryAbi'
import { wethAbi } from '@/abi/wethAbi'
import { lgoAbi } from '@/abi/lgoAbi'
import { kycRegistryAbi } from '@/abi/kycRegistryAbi'
import { playerRegistryAbi } from '@/abi/playerRegistryAbi'
import { ContractName } from '@/constants/contract-addresses'
import useReadContract from '@/hooks/contracts/read/useReadContract'
import { useTriggerOnChanged } from '@/hooks/utilities/useChanged'
import { useQueryClient } from '@tanstack/react-query'
import React, {
    createContext, useContext, useEffect, useState,
} from 'react'
import { useAccount, useBlockNumber } from 'wagmi'
import { isAddressEqual } from 'viem'
import { useSelectedGame } from './SelectedGameProvider'
import { usePrevious } from '@/hooks/utilities/usePrevious'

type BlockpotEventsContextType = {
    drawRoundBlockNumber: bigint
}

const BlockpotEventsContext = createContext<BlockpotEventsContextType>({
    drawRoundBlockNumber: 0n
})

type Props = {
    children: React.ReactNode
}

export default function BlockpotEventsProvider({ children }: Props): React.ReactElement {
    const queryClient = useQueryClient()
    const { gameContractName } = useSelectedGame()

    const draw = useReadContract(gameContractName, lotteryAbi)
    const weth = useReadContract(ContractName.WETH, wethAbi)
    const lgo = useReadContract(ContractName.LGO, lgoAbi)
    const kyc = useReadContract(ContractName.KYC_REGISTRY, kycRegistryAbi)
    const players = useReadContract(ContractName.PLAYER_REGISTRY, playerRegistryAbi)

    const { address } = useAccount()
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const [playerEntriesBlockNumber, setPlayerEntriesBlockNumber] = useState(0n)
    const [entriesBlockNumber, setEntriesBlockNumber] = useState(0n)
    const [wethBlockNumber, setWETHBlockNumber] = useState(0n)
    const [drawRoundBlockNumber, setDrawRoundBlockNumber] = useState(0n)
    const [lgoPlayerBlockNumber, setLgoPlayerBlockNumber] = useState(0n)
    const [lgoConfigBlockNumber, setLgoConfigBlockNumber] = useState(0n)
    const [kycPlayerBlockNumber, setKycPlayerBlockNumber] = useState(0n)
    const [kycPolicyBlockNumber, setKycPolicyBlockNumber] = useState(0n)
    const [playerStatusBlockNumber, setPlayerStatusBlockNumber] = useState(0n)
    const [showDebug, setShowDebug] = useState(false)

    // Reset state when selected game changes
    const previousSelectedGame = usePrevious(gameContractName)
    useEffect(() => {
        if (previousSelectedGame && previousSelectedGame !== gameContractName) {
            setPlayerEntriesBlockNumber(0n)
            setEntriesBlockNumber(0n)
            setDrawRoundBlockNumber(0n)
        }
    }, [gameContractName, previousSelectedGame])

    // Draw-core event watchers — Lottery* event names track the deployed ABI, TODO(BLO-693)
    useEffect(() => {
        const unwatchOnEntry = draw.watchEvent.LotteryOnEntry(
            {},
            {
                onLogs: (logs) => {
                    const shouldInvalidate = logs.some((l) => l.args.beneficiary === address)
                    if (shouldInvalidate) {
                        setPlayerEntriesBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                    if (logs.length > 0) {
                        setEntriesBlockNumber(logs[logs.length - 1].blockNumber)
                    }
                }
            }
        )
        const unwatchOnDrawnNumbersReceived = draw.watchEvent.LotteryDrawnNumbersReceived(
            {},
            {
                onLogs: (logs) => {
                    setDrawRoundBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                }
            }
        )

        const unwatchOnDrawingNumbers = draw.watchEvent.LotteryDrawingNumbers({
            onLogs: (logs) => {
                setDrawRoundBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
            }
        })

        const unwatchOnWinnerSelected = draw.watchEvent.LotteryWinnerSelected({
            onLogs: (logs) => {
                setDrawRoundBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
            }
        })

        const unwatchOnNoWinner = draw.watchEvent.LotteryNoWinner({
            onLogs: (logs) => {
                setDrawRoundBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
            }
        })

        return () => {
            console.log(`Unwatching draw events for ${draw.address}`)
            unwatchOnEntry()
            unwatchOnDrawingNumbers()
            unwatchOnNoWinner()
            unwatchOnDrawnNumbersReceived()
            unwatchOnWinnerSelected()
        }
    }, [draw.address, address]) // eslint-disable-line react-hooks/exhaustive-deps

    // LGO Event Watchers
    useEffect(() => {
        // v2 routes every entry through LGO, so the Draw core’s LotteryOnEntry beneficiary
        // is the LGO contract — never the player. The real player lands here in
        // LGOEntry.args.player, so this watcher is the source of truth for
        // player-scoped entry-cache invalidation as well as lifetime/balance bumps.
        const unwatchLGOEntry = lgo.watchEvent.LGOEntry(
            {},
            {
                onLogs: (logs) => {
                    if (!address) return
                    const matches = logs.some((l) => l.args.player && isAddressEqual(l.args.player, address))
                    if (matches) {
                        const latestBlock = logs[logs.length - 1].blockNumber ?? 0n
                        setLgoPlayerBlockNumber(latestBlock)
                        setPlayerEntriesBlockNumber(latestBlock)
                    }
                },
            },
        )
        const unwatchPlayerCredited = lgo.watchEvent.PlayerCredited(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setLgoPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        // PlayerCredited (escrowed) and PlayerPaidDirect (transferred) are
        // disjoint — both bump lifetimeWonEurMinor, so both must refresh
        // lifetime + the registry's compliance reads (the on-chain ladder
        // pulls wagered + largestSingleWin via IKYCActivityProvider). Only
        // the former affects the pullable escrow balance, but invalidating
        // balances on direct-pay is harmless.
        const unwatchPlayerPaidDirect = lgo.watchEvent.PlayerPaidDirect(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setLgoPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        const unwatchWithdrawn = lgo.watchEvent.Withdrawn(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setLgoPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        const unwatchOperatorFeeBpsUpdated = lgo.watchEvent.OperatorFeeBpsUpdated({
            onLogs: (logs) => {
                setLgoConfigBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
            },
        })
        // Task-35 aggregation deltas. They fire alongside LGOEntry /
        // PlayerCredited / PlayerPaidDirect at the same site, so under normal
        // operation they're redundant with the watchers above — but the chain
        // is the source of truth for cumulative EUR after task 35, and a
        // dedicated subscription means a contract whose entry-time emit shape
        // changes (e.g. a future variant that bumps the lifetime counters
        // without an LGOEntry log) still invalidates the chain-read snapshot.
        const unwatchLifetimeWageredUpdated = lgo.watchEvent.LifetimeWageredUpdated(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setLgoPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        // Task 49 depends on this listener: net wagered (max(0, wagered − won))
        // governs the wager-track gate, so a win must invalidate ['lgo:lifetime']
        // for the headroom meter and the forward-looking entry guard to refresh.
        const unwatchLifetimeWonUpdated = lgo.watchEvent.LifetimeWonUpdated(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setLgoPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        // After task 48 the on-chain gate consults a separate
        // largestSingleWinEurMinor scalar, so a win that advances the
        // running max can flip the player's win-track tier (and therefore
        // tierOf / isCompliant) independently of the wager-track ladder.
        const unwatchLargestSingleWinUpdated = lgo.watchEvent.LargestSingleWinUpdated(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setLgoPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        // Task 94 meters every exit on lifetimeClaimedEurMinor (withdrawals,
        // full direct-pays, the paid slice of partial direct-pays) and gates
        // it against the tier's outflow cap. The flow meter and the
        // forward-looking claim guard read this scalar, so every bump must
        // invalidate ['lgo:lifetime'].
        const unwatchLifetimeClaimedUpdated = lgo.watchEvent.LifetimeClaimedUpdated(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setLgoPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )

        return () => {
            unwatchLGOEntry()
            unwatchPlayerCredited()
            unwatchPlayerPaidDirect()
            unwatchWithdrawn()
            unwatchOperatorFeeBpsUpdated()
            unwatchLifetimeWageredUpdated()
            unwatchLifetimeWonUpdated()
            unwatchLargestSingleWinUpdated()
            unwatchLifetimeClaimedUpdated()
        }
    }, [lgo.address, address]) // eslint-disable-line react-hooks/exhaustive-deps

    // KYC Event Watchers. After task 44 the registry owns the active KYCPolicy
    // (the EUR-minor profit ladder + per-tier required-gate masks) and exposes
    // a unified isCompliant(player) gate. PlayerGatesSet / TierOverrideSet /
    // TierOverrideCleared can each flip tierOf and isCompliant for a specific
    // player; PolicyAdded re-anchors the ladder and changes both for every
    // player as a side effect.
    useEffect(() => {
        const unwatchPlayerGatesSet = kyc.watchEvent.PlayerGatesSet(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setKycPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        const unwatchTierOverrideSet = kyc.watchEvent.TierOverrideSet(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setKycPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        const unwatchTierOverrideCleared = kyc.watchEvent.TierOverrideCleared(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setKycPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        // Task 94: the chainwrite worker can pause / unpause a player's entry
        // path via setEntryBlock — refresh the entryBlockedUntil read so the
        // entry form's disable state tracks the chain.
        const unwatchEntryBlockSet = kyc.watchEvent.EntryBlockSet(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setKycPlayerBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        const unwatchPolicyAdded = kyc.watchEvent.PolicyAdded(
            {},
            {
                onLogs: (logs) => {
                    setKycPolicyBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                },
            },
        )
        return () => {
            unwatchPlayerGatesSet()
            unwatchTierOverrideSet()
            unwatchTierOverrideCleared()
            unwatchEntryBlockSet()
            unwatchPolicyAdded()
        }
    }, [kyc.address, address]) // eslint-disable-line react-hooks/exhaustive-deps

    // PlayerRegistry Event Watchers
    useEffect(() => {
        const unwatchStatus = players.watchEvent.PlayerStatusChanged(
            {},
            {
                onLogs: (logs) => {
                    const matches = logs.some((l) => l.args.player === address)
                    if (matches) {
                        setPlayerStatusBlockNumber(logs[logs.length - 1].blockNumber ?? 0n)
                    }
                },
            },
        )
        return () => {
            unwatchStatus()
        }
    }, [players.address, address]) // eslint-disable-line react-hooks/exhaustive-deps

    // WETH Event Watchers
    useEffect(() => {
        const unwatchWithdrawal = weth.watchEvent.Withdrawal({ src: address }, {
            onLogs: (logs) => {
                setWETHBlockNumber(logs[logs.length - 1].blockNumber)
            }
        })

        const unwatchDeposit = weth.watchEvent.Deposit({ dst: address }, {
            onLogs: (logs) => {
                setWETHBlockNumber(logs[logs.length - 1].blockNumber)
            }
        })

        return () => {
            unwatchWithdrawal()
            unwatchDeposit()
        }
    }, [weth.address, address]) // eslint-disable-line react-hooks/exhaustive-deps

    // Triggers
    useTriggerOnChanged(wethBlockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['erc20', ContractName.WETH] })
    })

    useTriggerOnChanged(playerEntriesBlockNumber, async () => {
        const promises: Promise<void>[] = []
        promises.push(queryClient.invalidateQueries({ queryKey: ['currentRoundEntryIndexes'] }))
        promises.push(queryClient.invalidateQueries({ queryKey: ['roundPurchases'] }))
        promises.push(queryClient.invalidateQueries({ queryKey: ['playerEntries'] }))
        await Promise.all(promises)
        await queryClient.refetchQueries({ queryKey: ['currentRoundEntryIndexes'] })
        queryClient.refetchQueries({ queryKey: ['roundPurchases'] })
        queryClient.refetchQueries({ queryKey: ['playerEntries'] })
    })

    useTriggerOnChanged(entriesBlockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['drawState'] })
        queryClient.invalidateQueries({ queryKey: ['balanceAllocations'] })
    })

    useTriggerOnChanged(drawRoundBlockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['drawState'] })
        queryClient.invalidateQueries({ queryKey: ['gameLatestRoundIndex'] })
        queryClient.invalidateQueries({ queryKey: ['specificRound'] })
    })

    useTriggerOnChanged(lgoPlayerBlockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['lgo:balances'] })
        queryClient.invalidateQueries({ queryKey: ['lgo:lifetime'] })
        // Lifetime EUR-minor counters feed the registry's profit lookup, so
        // any LGO-side movement can flip isCompliant / tierOf for the player.
        queryClient.invalidateQueries({ queryKey: ['kyc:isCompliant'] })
        queryClient.invalidateQueries({ queryKey: ['kyc:tierOf'] })
    })

    useTriggerOnChanged(lgoConfigBlockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['lgo:operatorFeeBps'] })
        queryClient.invalidateQueries({ queryKey: ['lgo:entryQuote'] })
    })

    useTriggerOnChanged(kycPlayerBlockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['kyc:tierOf'] })
        queryClient.invalidateQueries({ queryKey: ['kyc:isCompliant'] })
        queryClient.invalidateQueries({ queryKey: ['kyc:verifiedAt'] })
        queryClient.invalidateQueries({ queryKey: ['kyc:entryBlockedUntil'] })
        // The two-track derivation in usePlayerActivityState walks the gate
        // bitmap directly, so PlayerGatesSet must refresh the gates read.
        queryClient.invalidateQueries({ queryKey: ['kyc:playerGates'] })
        queryClient.invalidateQueries({ queryKey: ['playerKyc'] })
    })

    useTriggerOnChanged(kycPolicyBlockNumber, () => {
        // PolicyAdded re-anchors the ladder for every wallet — invalidate
        // the policy read plus per-player tier / compliance reads.
        queryClient.invalidateQueries({ queryKey: ['kyc:activePolicy'] })
        queryClient.invalidateQueries({ queryKey: ['kyc:tierOf'] })
        queryClient.invalidateQueries({ queryKey: ['kyc:isCompliant'] })
    })

    useTriggerOnChanged(playerStatusBlockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['isPlayerActive'] })
        queryClient.invalidateQueries({ queryKey: ['playerStatus'] })
    })

    // TODO: Move this elsewhere, too many re-renders
    useTriggerOnChanged(blockNumber, () => {
        queryClient.invalidateQueries({ queryKey: ['balance'] })
    })

    return (
        <BlockpotEventsContext.Provider value={{
            drawRoundBlockNumber
        }}>
            <div className='w-full h-full relative'>
                {
                    !import.meta.env.PROD && (
                        <div className='absolute top-1 left-1 bg-background border border-border rounded-md p-2 z-10 text-xs font-mono cursor-pointer' onClick={() => setShowDebug(prev => !prev)}>
                            <p className='font-bold'>Block Numbers</p>
                            {
                                showDebug && (
                                    [
                                        `blockNumber: ${blockNumber}`,
                                        `drawRoundBlockNumber: ${drawRoundBlockNumber}`,
                                        `wethBlockNumber: ${wethBlockNumber}`,
                                        `playerEntriesBlockNumber: ${playerEntriesBlockNumber}`,
                                        `entriesBlockNumber: ${entriesBlockNumber}`,
                                    ]
                                        .toSorted()
                                        .map((line) => (
                                            <p key={line}>{line}</p>
                                        ))
                                )
                            }
                        </div>
                    )}
                {children}
            </div>
        </BlockpotEventsContext.Provider>
    )
}

export const useBlockpotEvents = () => {
    return useContext(BlockpotEventsContext)
}
