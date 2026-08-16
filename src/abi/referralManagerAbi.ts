export const referralManagerAbi = [
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
        'name': 'MAX_SHARE_BPS',
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
        'inputs': [],
        'name': 'claim',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'clawback',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': '',
                'type': 'bytes32'
            }
        ],
        'name': 'codeToReferrer',
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
        'name': 'defaultShareBps',
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
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'effectiveShareBps',
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
                        'internalType': 'address',
                        'name': 'lgo',
                        'type': 'address'
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
                        'internalType': 'uint16',
                        'name': 'defaultShareBps',
                        'type': 'uint16'
                    }
                ],
                'internalType': 'struct ReferralManager.InitParams',
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
        'inputs': [],
        'name': 'lgo',
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
        'inputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'playerReferrer',
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
                'name': 'player',
                'type': 'address'
            },
            {
                'internalType': 'string',
                'name': 'code',
                'type': 'string'
            }
        ],
        'name': 'processEntry',
        'outputs': [],
        'stateMutability': 'payable',
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
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'reactivateReferrer',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'string',
                'name': 'code',
                'type': 'string'
            }
        ],
        'name': 'referrerByCode',
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
                'name': 'player',
                'type': 'address'
            }
        ],
        'name': 'referrerOf',
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
                'name': '',
                'type': 'address'
            }
        ],
        'name': 'referrers',
        'outputs': [
            {
                'internalType': 'enum ReferralManager.ReferrerStatus',
                'name': 'status',
                'type': 'uint8'
            },
            {
                'internalType': 'uint16',
                'name': 'shareBpsOverride',
                'type': 'uint16'
            },
            {
                'internalType': 'bytes32',
                'name': 'codeHash',
                'type': 'bytes32'
            },
            {
                'internalType': 'uint256',
                'name': 'accrued',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'lifetimeEarned',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': 'lifetimeClaimed',
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
                'name': 'referrer',
                'type': 'address'
            },
            {
                'internalType': 'string',
                'name': 'code',
                'type': 'string'
            },
            {
                'internalType': 'uint16',
                'name': 'shareBpsOverride',
                'type': 'uint16'
            }
        ],
        'name': 'registerReferrer',
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
        'inputs': [
            {
                'internalType': 'uint16',
                'name': 'newBps',
                'type': 'uint16'
            }
        ],
        'name': 'setDefaultShareBps',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            },
            {
                'internalType': 'uint16',
                'name': 'newBps',
                'type': 'uint16'
            }
        ],
        'name': 'setReferrerShareBps',
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
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'suspendReferrer',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'terminateReferrer',
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
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'uint16',
                'name': 'oldBps',
                'type': 'uint16'
            },
            {
                'indexed': false,
                'internalType': 'uint16',
                'name': 'newBps',
                'type': 'uint16'
            }
        ],
        'name': 'DefaultShareBpsUpdated',
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
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'PlayerBound',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'ReferrerReactivated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'bytes32',
                'name': 'codeHash',
                'type': 'bytes32'
            },
            {
                'indexed': false,
                'internalType': 'string',
                'name': 'code',
                'type': 'string'
            },
            {
                'indexed': false,
                'internalType': 'uint16',
                'name': 'shareBpsOverride',
                'type': 'uint16'
            }
        ],
        'name': 'ReferrerRegistered',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint16',
                'name': 'oldBps',
                'type': 'uint16'
            },
            {
                'indexed': false,
                'internalType': 'uint16',
                'name': 'newBps',
                'type': 'uint16'
            }
        ],
        'name': 'ReferrerShareBpsUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'ReferrerSuspended',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'ReferrerTerminated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            },
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
            }
        ],
        'name': 'RewardAccrued',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'RewardsClaimed',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'RewardsClawedBack',
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
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'AlreadyRegistered',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ClaimTransferFailed',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'codeHash',
                'type': 'bytes32'
            }
        ],
        'name': 'CodeTaken',
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
        'name': 'FailedCall',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'InvalidCode',
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
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            },
            {
                'internalType': 'enum ReferralManager.ReferrerStatus',
                'name': 'current',
                'type': 'uint8'
            }
        ],
        'name': 'InvalidStatusTransition',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'NotClaimable',
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
                'internalType': 'address',
                'name': 'caller',
                'type': 'address'
            }
        ],
        'name': 'NotLGO',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'ReentrancyGuardReentrantCall',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'referrer',
                'type': 'address'
            }
        ],
        'name': 'SanctionedReferrer',
        'type': 'error'
    },
    {
        'inputs': [
            {
                'internalType': 'uint16',
                'name': 'provided',
                'type': 'uint16'
            },
            {
                'internalType': 'uint16',
                'name': 'max',
                'type': 'uint16'
            }
        ],
        'name': 'ShareBpsTooHigh',
        'type': 'error'
    },
    {
        'inputs': [],
        'name': 'TreasuryTransferFailed',
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