export const randomNumberProviderAbi = [
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '_wrapperAddress',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': '_numberGenerator',
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
        'name': 'CALLBACK_GAS_PER_NUMBER',
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
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newOwner',
                'type': 'address'
            }
        ],
        'name': 'addOwner',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getBalance',
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
        'name': 'getLinkToken',
        'outputs': [
            {
                'internalType': 'contract LinkTokenInterface',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getOwners',
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
        'inputs': [
            {
                'internalType': 'uint256',
                'name': 'requestId',
                'type': 'uint256'
            }
        ],
        'name': 'getRandomNumberGeneratorInputs',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'seed',
                'type': 'uint256'
            },
            {
                'internalType': 'uint48',
                'name': 'maxNumber',
                'type': 'uint48'
            },
            {
                'internalType': 'uint8',
                'name': 'totalNumbers',
                'type': 'uint8'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'game',
                'type': 'address'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'getRandomNumberGeneratorInputsForGameAndRound',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': 'requestId',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'seed',
                'type': 'uint256'
            },
            {
                'internalType': 'uint48',
                'name': 'maxNumber',
                'type': 'uint48'
            },
            {
                'internalType': 'uint8',
                'name': 'totalNumbers',
                'type': 'uint8'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getRequestConfirmations',
        'outputs': [
            {
                'internalType': 'uint16',
                'name': '',
                'type': 'uint16'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'uint256',
                'name': '_requestId',
                'type': 'uint256'
            }
        ],
        'name': 'getRequestStatus',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': 'paid',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'seed',
                'type': 'uint256'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'bool',
                'name': 'fulfilled',
                'type': 'bool'
            },
            {
                'internalType': 'uint48',
                'name': 'maxNumber',
                'type': 'uint48'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'game',
                'type': 'address'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            }
        ],
        'name': 'getVrfProofForRound',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': 'requestId',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'seed',
                'type': 'uint256'
            },
            {
                'internalType': 'uint48',
                'name': 'maxNumber',
                'type': 'uint48'
            },
            {
                'internalType': 'uint8',
                'name': 'totalNumbers',
                'type': 'uint8'
            },
            {
                'internalType': 'bool',
                'name': 'fulfilled',
                'type': 'bool'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'i_vrfV2PlusWrapper',
        'outputs': [
            {
                'internalType': 'contract IVRFV2PlusWrapper',
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
                'name': 'account',
                'type': 'address'
            }
        ],
        'name': 'isOwner',
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
        'name': 'lastRequestId',
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
        'name': 'numberGenerator',
        'outputs': [
            {
                'internalType': 'contract INumberGenerator',
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
                'name': '_requestId',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256[]',
                'name': '_randomWords',
                'type': 'uint256[]'
            }
        ],
        'name': 'rawFulfillRandomWords',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'game',
                'type': 'address'
            }
        ],
        'name': 'registerGame',
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
        'name': 'registeredGames',
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
                'internalType': 'address',
                'name': 'owner',
                'type': 'address'
            }
        ],
        'name': 'removeOwner',
        'outputs': [],
        'stateMutability': 'nonpayable',
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
        'inputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'name': 'requestIds',
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
        'name': 'requestRandomWords',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': 'requestId',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'payable',
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
        'name': 'requestStatus',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': 'paid',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'seed',
                'type': 'uint256'
            },
            {
                'internalType': 'uint48',
                'name': 'maxNumber',
                'type': 'uint48'
            },
            {
                'internalType': 'uint32',
                'name': 'roundIndex',
                'type': 'uint32'
            },
            {
                'internalType': 'bool',
                'name': 'fulfilled',
                'type': 'bool'
            },
            {
                'internalType': 'uint8',
                'name': 'totalNumbers',
                'type': 'uint8'
            },
            {
                'internalType': 'address',
                'name': 'game',
                'type': 'address'
            },
            {
                'internalType': 'uint32',
                'name': 'gasLimit',
                'type': 'uint32'
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
                'internalType': 'uint32',
                'name': '',
                'type': 'uint32'
            }
        ],
        'name': 'roundIndexToRequestId',
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
        'inputs': [],
        'name': 'wrapperAddress',
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
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'isOwner',
                'type': 'bool'
            }
        ],
        'name': 'OwnershipChange',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'game',
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
                'internalType': 'uint256',
                'name': 'requestId',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'seed',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint48',
                'name': 'maxNumber',
                'type': 'uint48'
            },
            {
                'indexed': false,
                'internalType': 'uint8',
                'name': 'totalNumbers',
                'type': 'uint8'
            }
        ],
        'name': 'RandomNumbersFulfilled',
        'type': 'event'
    },
    {
        'inputs': [],
        'name': 'CannotRemoveLastOwner',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'GameNotRegistered',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NotAnOwner',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NotEnoughRandomWords',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'have',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'want',
                'type': 'address'
            }
        ],
        'name': 'OnlyVRFWrapperCanFulfill',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'RejectionSamplingFailed',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'RequestNotFound',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ZeroAddressOwner',
        'type': 'error'
    }
] as const