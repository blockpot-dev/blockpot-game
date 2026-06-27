export const lgoAbi = [
    {
        'inputs': [],
        'stateMutability': 'nonpayable',
        'type': 'constructor'
    },
    {
        'stateMutability': 'payable',
        'type': 'receive'
    },
    {
        'inputs': [],
        'name': 'DEFAULT_ADMIN_ROLE',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'MAX_OPERATOR_FEE_BPS',
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
        'inputs': [],
        'name': 'OPERATOR_ROLE',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'SEQUENCER_GRACE_PERIOD_SECONDS',
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
        'inputs': [],
        'name': 'TREASURY_ROLE',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'UPGRADER_ROLE',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'UPGRADE_INTERFACE_VERSION',
        'outputs': [
            {
                'internalType': 'string',
                'name': '',
                'type': 'string'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery_',
                'type': 'address'
            }
        ],
        'name': 'addLottery',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'balanceEth',
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
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'balanceWeth',
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
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            }
        ],
        'name': 'claimedEurMinorOf',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery_',
                'type': 'address'
            },
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
            }
        ],
        'name': 'enter',
        'outputs': [
            {
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery_',
                'type': 'address'
            },
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
            }
        ],
        'name': 'enterWeth',
        'outputs': [
            {
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            },
            {
                'internalType': 'uint32',
                'name': '',
                'type': 'uint32'
            },
            {
                'internalType': 'uint48',
                'name': '',
                'type': 'uint48'
            }
        ],
        'name': 'entryOwnerOf',
        'outputs': [
            {
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'internalType': 'bool',
                'name': 'payoutInWeth',
                'type': 'bool'
            },
            {
                'internalType': 'bool',
                'name': 'routed',
                'type': 'bool'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery_',
                'type': 'address'
            },
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
            },
            {
                'internalType': 'uint256',
                'name': 'opFee',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'ethUsdFeed',
        'outputs': [
            {
                'internalType': 'contract AggregatorV3Interface',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'eurUsdFeed',
        'outputs': [
            {
                'internalType': 'contract AggregatorV3Interface',
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
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'fundsManagerOf',
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
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            }
        ],
        'name': 'getRoleAdmin',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            },
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            }
        ],
        'name': 'grantRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            },
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            }
        ],
        'name': 'hasRole',
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
        'inputs': [
            {
                'components': [
                    {
                        'internalType': 'address',
                        'name': 'admin',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'operator',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'treasury',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'upgrader',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address[]',
                        'name': 'initialLotteries',
                        'type': 'address[]'
                    },
                    {
                        'internalType': 'address',
                        'name': 'rewardLostAndFound',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'weth',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'kycRegistry',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'players',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'ethUsdFeed',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'operatorFeeBps',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'address payable',
                        'name': 'operatorTreasury',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'sanctionsOracle',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'sequencerUptimeFeed',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'eurUsdFeed',
                        'type': 'address'
                    }
                ],
                'internalType': 'struct LGO.InitParams',
                'name': 'p',
                'type': 'tuple'
            }
        ],
        'name': 'initialize',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'isLottery',
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
        'name': 'kycRegistry',
        'outputs': [
            {
                'internalType': 'contract IKYCRegistry',
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
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'largestSingleWinEurMinor',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            }
        ],
        'name': 'largestSingleWinEurMinorOf',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'lifetimeClaimedEurMinor',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'lifetimeWageredEurMinor',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'lifetimeWonEurMinor',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'lotteries',
        'outputs': [
            {
                'internalType': 'address[]',
                'name': '',
                'type': 'address[]'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'lotteriesCount',
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
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'lotteryOfFundsManager',
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
        'name': 'operatorFeeBps',
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
        'inputs': [],
        'name': 'operatorTreasury',
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
        'name': 'players',
        'outputs': [
            {
                'internalType': 'contract PlayerRegistry',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'proxiableUUID',
        'outputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery_',
                'type': 'address'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'reclaimLostAndFound',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery_',
                'type': 'address'
            }
        ],
        'name': 'removeLottery',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            },
            {
                'internalType': 'address',
                'name': 'callerConfirmation',
                'type': 'address'
            }
        ],
        'name': 'renounceRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            },
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            }
        ],
        'name': 'revokeRole',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'rewardLostAndFound',
        'outputs': [
            {
                'internalType': 'contract IBlockpotRewardLostAndFound',
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
                'internalType': 'address',
                'name': 'lottery_',
                'type': 'address'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'roundEntryIndices',
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
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            }
        ],
        'name': 'routePayout',
        'outputs': [],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            }
        ],
        'name': 'routePayoutWeth',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'sanctionsOracle',
        'outputs': [
            {
                'internalType': 'contract IChainalysisSanctionsOracle',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'sequencerUptimeFeed',
        'outputs': [
            {
                'internalType': 'contract AggregatorV3Interface',
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
                'internalType': 'address',
                'name': 'newFeed',
                'type': 'address'
            }
        ],
        'name': 'setEthUsdFeed',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newFeed',
                'type': 'address'
            }
        ],
        'name': 'setEurUsdFeed',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newRegistry',
                'type': 'address'
            }
        ],
        'name': 'setKycRegistry',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'internalType': 'int128',
                'name': 'wageredDelta',
                'type': 'int128'
            },
            {
                'internalType': 'int128',
                'name': 'wonDelta',
                'type': 'int128'
            },
            {
                'internalType': 'uint64',
                'name': 'ethUsd8',
                'type': 'uint64'
            },
            {
                'internalType': 'uint64',
                'name': 'eurUsd8',
                'type': 'uint64'
            },
            {
                'internalType': 'uint64',
                'name': 'atBlock',
                'type': 'uint64'
            },
            {
                'internalType': 'bytes32',
                'name': 'idempotencyKey',
                'type': 'bytes32'
            }
        ],
        'name': 'setLifetimeEurAdjustment',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'newBps',
                'type': 'uint256'
            }
        ],
        'name': 'setOperatorFeeBps',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address payable',
                'name': 'newTreasury',
                'type': 'address'
            }
        ],
        'name': 'setOperatorTreasury',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newOracle',
                'type': 'address'
            }
        ],
        'name': 'setSanctionsOracle',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newFeed',
                'type': 'address'
            }
        ],
        'name': 'setSequencerUptimeFeed',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes4',
                'name': 'interfaceId',
                'type': 'bytes4'
            }
        ],
        'name': 'supportsInterface',
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
        'name': 'unassignedEth',
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
        'inputs': [],
        'name': 'unassignedWeth',
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
                'internalType': 'address',
                'name': 'newImplementation',
                'type': 'address'
            },
            {
                'internalType': 'bytes',
                'name': 'data',
                'type': 'bytes'
            }
        ],
        'name': 'upgradeToAndCall',
        'outputs': [],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            }
        ],
        'name': 'wageredEurMinorOf',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'weth',
        'outputs': [
            {
                'internalType': 'contract IWETH',
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
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'internalType': 'bool',
                'name': 'inWeth',
                'type': 'bool'
            }
        ],
        'name': 'withdraw',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'internalType': 'bool',
                'name': 'inWeth',
                'type': 'bool'
            }
        ],
        'name': 'withdrawFor',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            }
        ],
        'name': 'wonEurMinorOf',
        'outputs': [
            {
                'internalType': 'uint128',
                'name': '',
                'type': 'uint128'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'oldFeed',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newFeed',
                'type': 'address'
            }
        ],
        'name': 'EthUsdFeedUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'oldFeed',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newFeed',
                'type': 'address'
            }
        ],
        'name': 'EurUsdFeedUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'version',
                'type': 'uint64'
            }
        ],
        'name': 'Initialized',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'oldRegistry',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newRegistry',
                'type': 'address'
            }
        ],
        'name': 'KycRegistryUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'indexed': false,
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            },
            {
                'indexed': false,
                'internalType': 'uint16',
                'name': 'amount',
                'type': 'uint16'
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'payoutInWeth',
                'type': 'bool'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'pea',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'cf',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'opFee',
                'type': 'uint256'
            }
        ],
        'name': 'LGOEntry',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'newDeltaEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'newRunningMaxEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'LargestSingleWinUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'deltaEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'newTotalEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'deltaWei',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'ethUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'eurUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'LifetimeClaimedUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'int128',
                'name': 'wageredDelta',
                'type': 'int128'
            },
            {
                'indexed': false,
                'internalType': 'int128',
                'name': 'wonDelta',
                'type': 'int128'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'newWageredTotal',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'newWonTotal',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'ethUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'eurUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'atBlock',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'bytes32',
                'name': 'idempotencyKey',
                'type': 'bytes32'
            }
        ],
        'name': 'LifetimeEurAdjusted',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'deltaWei',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'deltaEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'newLifetimeWageredEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'ethUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'eurUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'LifetimeWageredUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'deltaWei',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'deltaEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint128',
                'name': 'newLifetimeWonEurMinor',
                'type': 'uint128'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'ethUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'eurUsd8',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'LifetimeWonUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'fundsManager',
                'type': 'address'
            }
        ],
        'name': 'LotteryAdded',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'fundsManager',
                'type': 'address'
            }
        ],
        'name': 'LotteryRemoved',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'oldBps',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'newBps',
                'type': 'uint256'
            }
        ],
        'name': 'OperatorFeeBpsUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'recipient',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'OperatorFeePaid',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'oldTreasury',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newTreasury',
                'type': 'address'
            }
        ],
        'name': 'OperatorTreasuryUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'indexed': false,
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'inWeth',
                'type': 'bool'
            }
        ],
        'name': 'PlayerCredited',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'indexed': false,
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'inWeth',
                'type': 'bool'
            }
        ],
        'name': 'PlayerPaidDirect',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'reclaimedEth',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'creditedEth',
                'type': 'uint256'
            }
        ],
        'name': 'Reclaimed',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            },
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'previousAdminRole',
                'type': 'bytes32'
            },
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'newAdminRole',
                'type': 'bytes32'
            }
        ],
        'name': 'RoleAdminChanged',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'sender',
                'type': 'address'
            }
        ],
        'name': 'RoleGranted',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'role',
                'type': 'bytes32'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'sender',
                'type': 'address'
            }
        ],
        'name': 'RoleRevoked',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'oldOracle',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newOracle',
                'type': 'address'
            }
        ],
        'name': 'SanctionsOracleUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'oldFeed',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newFeed',
                'type': 'address'
            }
        ],
        'name': 'SequencerUptimeFeedUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'indexed': true,
                'internalType': 'uint48',
                'name': 'entryIndex',
                'type': 'uint48'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'inWeth',
                'type': 'bool'
            }
        ],
        'name': 'UnassignedPayout',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'implementation',
                'type': 'address'
            }
        ],
        'name': 'Upgraded',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'inWeth',
                'type': 'bool'
            }
        ],
        'name': 'Withdrawn',
        'type': 'event'
    },
    {
        'inputs': [],
        'name': 'AccessControlBadConfirmation',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            },
            {
                'internalType': 'bytes32',
                'name': 'neededRole',
                'type': 'bytes32'
            }
        ],
        'name': 'AccessControlUnauthorizedAccount',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'target',
                'type': 'address'
            }
        ],
        'name': 'AddressEmptyCode',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'AlreadyRouted',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'implementation',
                'type': 'address'
            }
        ],
        'name': 'ERC1967InvalidImplementation',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ERC1967NonPayable',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint64',
                'name': 'blockedUntil',
                'type': 'uint64'
            }
        ],
        'name': 'EntryBlocked',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'FailedCall',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'fundsManager',
                'type': 'address'
            }
        ],
        'name': 'FundsManagerCollision',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'requested',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'available',
                'type': 'uint256'
            }
        ],
        'name': 'InsufficientBalance',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'InvalidInitialization',
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
        'inputs': [
            {
                'internalType': 'int256',
                'name': 'answer',
                'type': 'int256'
            }
        ],
        'name': 'InvalidPrice',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            }
        ],
        'name': 'LotteryAlreadyRegistered',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NoLotteries',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NotActivePlayer',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NotCompliant',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NotInitializing',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'provided',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'max',
                'type': 'uint256'
            }
        ],
        'name': 'OperatorFeeBpsTooHigh',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'OperatorFeeTransferFailed',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'OperatorTreasuryUnset',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ReentrancyGuardReentrantCall',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'RoundNotFinalized',
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
        'name': 'SanctionedWallet',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'SequencerDown',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'UUPSUnauthorizedCallContext',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'slot',
                'type': 'bytes32'
            }
        ],
        'name': 'UUPSUnsupportedProxiableUUID',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'sender',
                'type': 'address'
            }
        ],
        'name': 'UnauthorizedEthTransfer',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'lottery',
                'type': 'address'
            }
        ],
        'name': 'UnsupportedLottery',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'uint48',
                'name': 'drawnNumber',
                'type': 'uint48'
            }
        ],
        'name': 'WinnerNotFound',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'expected',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'actual',
                'type': 'address'
            }
        ],
        'name': 'WrongCaller',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ZeroAddress',
        'type': 'error'
    }
] as const