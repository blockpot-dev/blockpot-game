export enum NetworkId {
    MAINNET = 1,
    TESTNET_GOERLI = 5,
  
    ARBITRUM = 42161,
    ARBITRUM_TESTNET = 421613,
  
    AVALANCHE = 43114,
    AVALANCHE_TESTNET = 43113,
  
    POLYGON = 137,
    POLYGON_TESTNET = 80001,
  
    FANTOM = 250,
    FANTOM_TESTNET = 4002,
  
    OPTIMISM = 10,
    OPTIMISM_TESTNET = 69,
  
    BOBA = 288,
    BOBA_TESTNET = 28,

    LOCAL = 31337,

    BLOCK_POT_TESTNET = 69696
  }
  
export type EthereumNetwork = NetworkId.MAINNET | NetworkId.TESTNET_GOERLI;

/**
 * Public JSON-RPC endpoints a reader can use to query the chain without trusting this app.
 * Only chains we deploy to are listed; the Blockpot testnet URL is whatever the build was
 * configured with. Missing entries surface as a `$RPC_URL` placeholder in verification snippets.
 */
export const PUBLIC_RPC_URL: Partial<Record<NetworkId, string>> = {
    [NetworkId.LOCAL]: 'http://127.0.0.1:8545',
    [NetworkId.MAINNET]: 'https://ethereum-rpc.publicnode.com',
    [NetworkId.ARBITRUM_TESTNET]: 'https://goerli-rollup.arbitrum.io/rpc',
    [NetworkId.POLYGON_TESTNET]: 'https://rpc-mumbai.maticvigil.com',
    ...(import.meta.env.VITE_TESTNET_RPC_URL
        ? { [NetworkId.BLOCK_POT_TESTNET]: import.meta.env.VITE_TESTNET_RPC_URL as string }
        : {}),
}

export const CHAIN_DISPLAY_NAME: Partial<Record<NetworkId, string>> = {
    [NetworkId.LOCAL]: 'Local anvil',
    [NetworkId.MAINNET]: 'Ethereum mainnet',
    [NetworkId.ARBITRUM_TESTNET]: 'Arbitrum Goerli',
    [NetworkId.POLYGON_TESTNET]: 'Polygon Mumbai',
    [NetworkId.BLOCK_POT_TESTNET]: 'Blockpot Testnet',
}
