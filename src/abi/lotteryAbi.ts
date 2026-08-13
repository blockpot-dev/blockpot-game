export const lotteryAbi = [
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '_randomNumberProvider',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': '_weth_',
                'type': 'address'
            },
            {
                'internalType': 'address payable',
                'name': '_rewardLostAndFound',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': '_complianceRegistry',
                'type': 'address'
            },
            {
                'internalType': 'address payable',
                'name': '_devcoAddress',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': '_parentGameFundsManager',
                'type': 'address'
            },
            {
                'components': [
                    {
                        'internalType': 'uint24[]',
                        'name': 'prizeTierAllocations',
                        'type': 'uint24[]'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'nextPotAllocation',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'parentGamePotAllocation',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'timeBetweenRounds',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'ignoreOdds',
                        'type': 'bool'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceInitial',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceMultiplier',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceIncrement',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceMax',
                        'type': 'uint24'
                    }
                ],
                'internalType': 'struct GameConfig',
                'name': 'gameConfig',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'nonpayable',
        'type': 'constructor'
    },
    {
        'stateMutability': 'payable',
        'type': 'receive'
    },
    {
        'inputs': [],
        'name': 'balances',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'uint256',
                        'name': 'nextPot',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'pot',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'parentGame',
                        'type': 'uint256'
                    }
                ],
                'internalType': 'struct BalanceAllocations',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'chanceOfWinner',
        'outputs': [
            {
                'internalType': 'uint24',
                'name': '',
                'type': 'uint24'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'complianceRegistry',
        'outputs': [
            {
                'internalType': 'contract ComplianceRegistry',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'contributorFeeBps',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'pure',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'currentGameConfig',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'uint24[]',
                        'name': 'prizeTierAllocations',
                        'type': 'uint24[]'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'nextPotAllocation',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'parentGamePotAllocation',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'timeBetweenRounds',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'ignoreOdds',
                        'type': 'bool'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceInitial',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceMultiplier',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceIncrement',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chanceMax',
                        'type': 'uint24'
                    }
                ],
                'internalType': 'struct GameConfig',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'currentPots',
        'outputs': [
            {
                'internalType': 'uint256[]',
                'name': '',
                'type': 'uint256[]'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'currentRoundIndex',
        'outputs': [
            {
                'internalType': 'uint32',
                'name': '',
                'type': 'uint32'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'devcoAddress',
        'outputs': [
            {
                'internalType': 'address payable',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'drawNumbers',
        'outputs': [],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'uint16',
                'name': 'amount',
                'type': 'uint16'
            },
            {
                'internalType': 'bool',
                'name': 'payoutInWeth',
                'type': 'bool'
            },
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'enter',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'address payable',
                        'name': 'beneficiary',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'entryStart',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'uint16',
                        'name': 'amount',
                        'type': 'uint16'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'payoutInWeth',
                        'type': 'bool'
                    }
                ],
                'internalType': 'struct LotteryEntry',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'components': [
                    {
                        'internalType': 'address',
                        'name': 'benefactor',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'beneficiary',
                        'type': 'address'
                    }
                ],
                'internalType': 'struct EntryAddresses',
                'name': 'addresses',
                'type': 'tuple'
            },
            {
                'internalType': 'uint16',
                'name': 'amount',
                'type': 'uint16'
            },
            {
                'internalType': 'bool',
                'name': 'payoutInWeth',
                'type': 'bool'
            },
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'enterFor',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'address payable',
                        'name': 'beneficiary',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'entryStart',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'uint16',
                        'name': 'amount',
                        'type': 'uint16'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'payoutInWeth',
                        'type': 'bool'
                    }
                ],
                'internalType': 'struct LotteryEntry',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'uint16',
                'name': 'amount',
                'type': 'uint16'
            },
            {
                'internalType': 'bool',
                'name': 'payoutInWeth',
                'type': 'bool'
            },
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'enterWeth',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'address payable',
                        'name': 'beneficiary',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'entryStart',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'uint16',
                        'name': 'amount',
                        'type': 'uint16'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'payoutInWeth',
                        'type': 'bool'
                    }
                ],
                'internalType': 'struct LotteryEntry',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'components': [
                    {
                        'internalType': 'address',
                        'name': 'benefactor',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'beneficiary',
                        'type': 'address'
                    }
                ],
                'internalType': 'struct EntryAddresses',
                'name': 'addresses',
                'type': 'tuple'
            },
            {
                'internalType': 'uint16',
                'name': 'amount',
                'type': 'uint16'
            },
            {
                'internalType': 'bool',
                'name': 'payoutInWeth',
                'type': 'bool'
            },
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'enterWethFor',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'address payable',
                        'name': 'beneficiary',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'entryStart',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'uint16',
                        'name': 'amount',
                        'type': 'uint16'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'payoutInWeth',
                        'type': 'bool'
                    }
                ],
                'internalType': 'struct LotteryEntry',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'address',
                'name': 'beneficiary',
                'type': 'address'
            }
        ],
        'name': 'entriesForBeneficiary',
        'outputs': [
            {
                'internalType': 'uint48[]',
                'name': '',
                'type': 'uint48[]'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'entryAmount',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'pure',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint16',
                'name': 'amount',
                'type': 'uint16'
            }
        ],
        'name': 'entryQuote',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': 'total',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'pea',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'cf',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'pure',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'feeAllocations',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'uint256',
                        'name': 'nextPot',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'parentGame',
                        'type': 'uint256'
                    }
                ],
                'internalType': 'struct FeeAllocations',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'finalizeRound',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'fundsManager',
        'outputs': [
            {
                'internalType': 'contract UnipotFundsManager',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'getEntry',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'address payable',
                        'name': 'beneficiary',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'entryStart',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'uint16',
                        'name': 'amount',
                        'type': 'uint16'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'payoutInWeth',
                        'type': 'bool'
                    }
                ],
                'internalType': 'struct LotteryEntry',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'getMaxNumberForRound',
        'outputs': [
            {
                'internalType': 'uint48',
                'name': '',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getNextDrawTime',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'getRemainingEntriesNeededForDrawing',
        'outputs': [
            {
                'internalType': 'uint48',
                'name': '',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'getRoundData',
        'outputs': [
            {
                'components': [
                    {
                        'components': [
                            {
                                'internalType': 'uint256',
                                'name': 'prize',
                                'type': 'uint256'
                            },
                            {
                                'internalType': 'address payable',
                                'name': 'winner',
                                'type': 'address'
                            },
                            {
                                'internalType': 'uint48',
                                'name': 'number',
                                'type': 'uint48'
                            }
                        ],
                        'internalType': 'struct DrawnNumber[]',
                        'name': 'draws',
                        'type': 'tuple[]'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'prizePool',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'drawTime',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'uint48',
                        'name': 'entryCount',
                        'type': 'uint48'
                    },
                    {
                        'internalType': 'uint32',
                        'name': 'potIndex',
                        'type': 'uint32'
                    },
                    {
                        'internalType': 'uint16',
                        'name': 'roundIndexInPot',
                        'type': 'uint16'
                    },
                    {
                        'internalType': 'uint24',
                        'name': 'chance',
                        'type': 'uint24'
                    },
                    {
                        'internalType': 'enum RoundStatus',
                        'name': 'status',
                        'type': 'uint8'
                    }
                ],
                'internalType': 'struct LotteryRound',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getTimeBetweenRounds',
        'outputs': [
            {
                'internalType': 'uint48',
                'name': '',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'isDrawingNumbers',
        'outputs': [
            {
                'internalType': 'bool',
                'name': '',
                'type': 'bool'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'lastEntryEnd',
        'outputs': [
            {
                'internalType': 'uint48',
                'name': '',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'lastEntryEndForRound',
        'outputs': [
            {
                'internalType': 'uint48',
                'name': '',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'numbersToDraw',
        'outputs': [
            {
                'internalType': 'uint8',
                'name': '',
                'type': 'uint8'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'parentGameFundsManager',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'peaPerEntry',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'pure',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'randomNumberProvider',
        'outputs': [
            {
                'internalType': 'contract LotteryRandomNumberProvider',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint48[]',
                'name': 'drawnNumbers',
                'type': 'uint48[]'
            },
            {
                'internalType': 'uint32',
                'name': 'drawnForRoundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'receiveDrawnNumbers',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'name': 'rnds',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': 'prizePool',
                'type': 'uint256'
            },
            {
                'internalType': 'uint48',
                'name': 'drawTime',
                'type': 'uint48'
            },
            {
                'internalType': 'uint48',
                'name': 'entryCount',
                'type': 'uint48'
            },
            {
                'internalType': 'uint32',
                'name': 'potIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'uint16',
                'name': 'roundIndexInPot',
                'type': 'uint16'
            },
            {
                'internalType': 'uint24',
                'name': 'chance',
                'type': 'uint24'
            },
            {
                'internalType': 'enum RoundStatus',
                'name': 'status',
                'type': 'uint8'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'totalEntryPrice',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'pure',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'typeAndVersion',
        'outputs': [
            {
                'internalType': 'string',
                'name': '',
                'type': 'string'
            }
        ],
        'stateMutability': 'pure',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'winnerTierAllocations',
        'outputs': [
            {
                'internalType': 'uint24[]',
                'name': '',
                'type': 'uint24[]'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'ContributorFeePaid',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint32',
                'name': 'roundNumber',
                'type': 'uint32'
            }
        ],
        'name': 'LotteryDrawingNumbers',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'LotteryDrawnNumbersReceived',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint32',
                'name': 'roundNumber',
                'type': 'uint32'
            }
        ],
        'name': 'LotteryNoWinner',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'beneficiary',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint48',
                'name': 'entryCount',
                'type': 'uint48'
            },
            {
                'indexed': false,
                'internalType': 'uint48',
                'name': 'totalEntryCount',
                'type': 'uint48'
            }
        ],
        'name': 'LotteryOnEntry',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint32',
                'name': 'roundNumber',
                'type': 'uint32'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'winnerAddress',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'winningNumber',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint8',
                'name': 'place',
                'type': 'uint8'
            }
        ],
        'name': 'LotteryWinnerSelected',
        'type': 'event'
    },
    {
        'inputs': [],
        'name': 'AlreadyDrawingNumbers',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'CannotEnterWhileDrawingNumbers',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ContributorFeeTransferFailed',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'DrawTimeNotReached',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'EntryIndexOutOfBounds',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'EntryPaddingOverflow',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'FinalizingWrongRound',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'FundsTransferFailed',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'InsufficientAmountForPurchase',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint48',
                'name': 'currentMaxNumber',
                'type': 'uint48'
            },
            {
                'internalType': 'uint48',
                'name': 'requiredMaxNumber',
                'type': 'uint48'
            },
            {
                'internalType': 'uint8',
                'name': 'numbersToDraw',
                'type': 'uint8'
            }
        ],
        'name': 'InsufficientEntriesForDrawing',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'addr',
                'type': 'address'
            }
        ],
        'name': 'InvalidAddress',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'InvalidChanceParameters',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'received',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'expected',
                'type': 'uint256'
            }
        ],
        'name': 'InvalidPayment',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'InvalidPotAllocations',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'InvalidPrizeTierAllocations',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NoEntriesInRound',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NotRandomNumberProvider',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'OperatorNotWhitelisted',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'PickedForWrongRound',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ReentrancyGuardReentrantCall',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'RoundAlreadyReceivedDrawnNumbers',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'RoundIndexOutOfBounds',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'RoundNotReadyToBeFinalized',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'token',
                'type': 'address'
            }
        ],
        'name': 'SafeERC20FailedOperation',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'UnauthorizedEthTransfer',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'provided',
                'type': 'uint32'
            },
            {
                'internalType': 'uint32',
                'name': 'expected',
                'type': 'uint32'
            }
        ],
        'name': 'WrongRoundIndex',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ZeroAddress',
        'type': 'error'
    }
] as const