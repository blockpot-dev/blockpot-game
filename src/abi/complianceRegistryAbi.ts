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
        'inputs': [],
        'name': 'CannotRemoveLastOwner',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NotAnOwner',
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
        'inputs': [],
        'name': 'ZeroAddress',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ZeroAddressOwner',
        'type': 'error'
    }
] as const