export const complianceRegistryAbi = [
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'initialOwner',
                'type': 'address'
            }
        ],
        'stateMutability': 'nonpayable',
        'type': 'constructor'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'addOperator',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getWhitelistedOperators',
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
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'isWhitelisted',
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
        'inputs': [
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'removeOperator',
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
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'OperatorAdded',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'OperatorRemoved',
        'type': 'event'
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
        'inputs': [
            {
                'internalType': 'address',
                'name': 'operator',
                'type': 'address'
            }
        ],
        'name': 'OperatorAlreadyWhitelisted',
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
        'name': 'ZeroAddress',
        'type': 'error'
    }
] as const