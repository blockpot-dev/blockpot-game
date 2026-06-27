export const kycRegistryAbi = [
    {
        'inputs': [],
        'stateMutability': 'nonpayable',
        'type': 'constructor'
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
        'name': 'KYC_ADMIN_ROLE',
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
        'name': 'MAX_TIER',
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
        'name': 'MAX_TIERS_PER_POLICY',
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
        'name': 'POLICY_ADMIN_ROLE',
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
        'inputs': [],
        'name': 'WRITER_ROLE',
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
        'name': 'activePolicy',
        'outputs': [
            {
                'components': [
                    {
                        'components': [
                            {
                                'internalType': 'uint256',
                                'name': 'requiredGates',
                                'type': 'uint256'
                            },
                            {
                                'internalType': 'uint256',
                                'name': 'inflowCapEurMinor',
                                'type': 'uint256'
                            },
                            {
                                'internalType': 'uint256',
                                'name': 'outflowCapEurMinor',
                                'type': 'uint256'
                            }
                        ],
                        'internalType': 'struct KYCRegistry.TierPolicy[]',
                        'name': 'tiers',
                        'type': 'tuple[]'
                    },
                    {
                        'internalType': 'string',
                        'name': 'description',
                        'type': 'string'
                    }
                ],
                'internalType': 'struct KYCRegistry.KYCPolicy',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'activePolicyIndex',
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
        'name': 'activityProvider',
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
                'components': [
                    {
                        'internalType': 'uint256',
                        'name': 'requiredGates',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'inflowCapEurMinor',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'outflowCapEurMinor',
                        'type': 'uint256'
                    }
                ],
                'internalType': 'struct KYCRegistry.TierPolicy[]',
                'name': 'tiers',
                'type': 'tuple[]'
            },
            {
                'internalType': 'string',
                'name': 'description',
                'type': 'string'
            }
        ],
        'name': 'addPolicy',
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
        'name': 'clearTierOverride',
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
        'name': 'entryBlockedUntil',
        'outputs': [
            {
                'internalType': 'uint64',
                'name': '',
                'type': 'uint64'
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
        'name': 'getPlayerGates',
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
                'internalType': 'address',
                'name': 'user',
                'type': 'address'
            }
        ],
        'name': 'inflowHeadroomOf',
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
                'name': 'admin',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'kycAdmin',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'upgrader',
                'type': 'address'
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
                'name': 'user',
                'type': 'address'
            }
        ],
        'name': 'isCompliant',
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
                'name': 'user',
                'type': 'address'
            },
            {
                'internalType': 'uint128',
                'name': 'betEurMinor',
                'type': 'uint128'
            }
        ],
        'name': 'isCompliantForBet',
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
                'name': 'user',
                'type': 'address'
            },
            {
                'internalType': 'uint128',
                'name': 'claimEurMinor',
                'type': 'uint128'
            }
        ],
        'name': 'isCompliantForClaim',
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
                'name': 'player',
                'type': 'address'
            }
        ],
        'name': 'isEntryBlocked',
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
                'name': 'user',
                'type': 'address'
            },
            {
                'internalType': 'uint8',
                'name': 'minTier',
                'type': 'uint8'
            }
        ],
        'name': 'meets',
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
                'name': 'user',
                'type': 'address'
            }
        ],
        'name': 'outflowHeadroomOf',
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
        'name': 'overrideOf',
        'outputs': [
            {
                'internalType': 'bool',
                'name': 'active',
                'type': 'bool'
            },
            {
                'internalType': 'uint8',
                'name': 'tier',
                'type': 'uint8'
            },
            {
                'internalType': 'uint64',
                'name': 'expiresAt',
                'type': 'uint64'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'policiesCount',
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
                'internalType': 'uint256',
                'name': 'index',
                'type': 'uint256'
            }
        ],
        'name': 'policyAt',
        'outputs': [
            {
                'components': [
                    {
                        'components': [
                            {
                                'internalType': 'uint256',
                                'name': 'requiredGates',
                                'type': 'uint256'
                            },
                            {
                                'internalType': 'uint256',
                                'name': 'inflowCapEurMinor',
                                'type': 'uint256'
                            },
                            {
                                'internalType': 'uint256',
                                'name': 'outflowCapEurMinor',
                                'type': 'uint256'
                            }
                        ],
                        'internalType': 'struct KYCRegistry.TierPolicy[]',
                        'name': 'tiers',
                        'type': 'tuple[]'
                    },
                    {
                        'internalType': 'string',
                        'name': 'description',
                        'type': 'string'
                    }
                ],
                'internalType': 'struct KYCRegistry.KYCPolicy',
                'name': '',
                'type': 'tuple'
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
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newProvider',
                'type': 'address'
            }
        ],
        'name': 'setActivityProvider',
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
                'internalType': 'uint64',
                'name': 'blockedUntil',
                'type': 'uint64'
            }
        ],
        'name': 'setEntryBlock',
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
                'name': 'gates',
                'type': 'uint256'
            }
        ],
        'name': 'setPlayerGates',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address[]',
                'name': 'players',
                'type': 'address[]'
            },
            {
                'internalType': 'uint256[]',
                'name': 'gates',
                'type': 'uint256[]'
            }
        ],
        'name': 'setPlayerGatesBatch',
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
                'internalType': 'uint8',
                'name': 'tier',
                'type': 'uint8'
            },
            {
                'internalType': 'uint64',
                'name': 'expiresAt',
                'type': 'uint64'
            }
        ],
        'name': 'setTierOverride',
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
        'inputs': [
            {
                'internalType': 'address',
                'name': 'user',
                'type': 'address'
            }
        ],
        'name': 'tierOf',
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
                'name': 'user',
                'type': 'address'
            }
        ],
        'name': 'verifiedAt',
        'outputs': [
            {
                'internalType': 'uint64',
                'name': '',
                'type': 'uint64'
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
                'name': 'oldProvider',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newProvider',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'ActivityProviderUpdated',
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
                'internalType': 'uint64',
                'name': 'oldBlockedUntil',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'newBlockedUntil',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'EntryBlockSet',
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
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'oldGates',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'newGates',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'PlayerGatesSet',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'uint256',
                'name': 'index',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint8',
                'name': 'tierCount',
                'type': 'uint8'
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'description',
                'type': 'string'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'PolicyAdded',
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
                'indexed': true,
                'internalType': 'address',
                'name': 'player',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint8',
                'name': 'oldTier',
                'type': 'uint8'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'TierOverrideCleared',
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
                'internalType': 'uint8',
                'name': 'oldTier',
                'type': 'uint8'
            },
            {
                'indexed': false,
                'internalType': 'uint8',
                'name': 'newTier',
                'type': 'uint8'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'expiresAt',
                'type': 'uint64'
            },
            {
                'indexed': false,
                'internalType': 'uint64',
                'name': 'at',
                'type': 'uint64'
            }
        ],
        'name': 'TierOverrideSet',
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
        'inputs': [],
        'name': 'EmptyPolicy',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'FailedCall',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'InvalidInitialization',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'LengthMismatch',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NoActivePolicy',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NonMonotonicInflowCaps',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'NonMonotonicOutflowCaps',
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
                'name': 'index',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'length',
                'type': 'uint256'
            }
        ],
        'name': 'PolicyIndexOutOfRange',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'T0RequiredGatesMustBeZero',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint8',
                'name': 'tier',
                'type': 'uint8'
            }
        ],
        'name': 'TierTooHigh',
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
        'name': 'TooManyTiers',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'TopTierInflowCapNotMax',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'TopTierOutflowCapNotMax',
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
        'inputs': [],
        'name': 'ZeroAddress',
        'type': 'error'
    }
] as const