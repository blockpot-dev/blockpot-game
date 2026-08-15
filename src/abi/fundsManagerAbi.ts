export const fundsManagerAbi = [
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'fundsAllocationProvider',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'wrappedToken',
                'type': 'address'
            },
            {
                'internalType': 'address payable',
                'name': 'rewardLostAndFoundAddress',
                'type': 'address'
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
        'name': 'allocateEntry',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'currentPot',
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
                'components': [
                    {
                        'internalType': 'address payable',
                        'name': 'beneficiary',
                        'type': 'address'
                    },
                    {
                        'internalType': 'bool',
                        'name': 'payoutInWeth',
                        'type': 'bool'
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
                'internalType': 'struct PrizePayout[]',
                'name': 'payouts',
                'type': 'tuple[]'
            }
        ],
        'name': 'disbursePrizes',
        'outputs': [
            {
                'internalType': 'uint256[]',
                'name': 'prizes',
                'type': 'uint256[]'
            }
        ],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'targetFundsManager',
                'type': 'address'
            }
        ],
        'name': 'forwardToParentGame',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'moveNextPotIntoCurrentPot',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'nextPot',
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
        'name': 'owner',
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
        'name': 'parentGamePot',
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
        'name': 'pots',
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
        'name': 'renounceOwnership',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'rewardLostAndFound',
        'outputs': [
            {
                'internalType': 'contract UnipotRewardLostAndFound',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'seedPot',
        'outputs': [],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newOwner',
                'type': 'address'
            }
        ],
        'name': 'transferOwnership',
        'outputs': [],
        'stateMutability': 'nonpayable',
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
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'previousOwner',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'newOwner',
                'type': 'address'
            }
        ],
        'name': 'OwnershipTransferred',
        'type': 'event'
    },
    {
        'inputs': [],
        'name': 'ApproveFailed',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'FailedToAllocateFundsToParent',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'owner',
                'type': 'address'
            }
        ],
        'name': 'OwnableInvalidOwner',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            }
        ],
        'name': 'OwnableUnauthorizedAccount',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ReentrancyGuardReentrantCall',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ResetApproveFailed',
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
        'inputs': [
            {
                'internalType': 'address',
                'name': 'sender',
                'type': 'address'
            }
        ],
        'name': 'UnauthorizedDeposit',
        'type': 'error'
    }
] as const