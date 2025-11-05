import { http, createConfig } from 'wagmi'
import { base, anvil } from 'wagmi/chains'

// Determine which chain to use based on environment
const isLocalChain = process.env.NEXT_PUBLIC_CHAIN_ID === '31337'
const chain = isLocalChain ? anvil : base

// Get RPC URL - for local (anvil) use localhost, for base use mainnet
const getRpcUrl = () => {
  if (isLocalChain) {
    return process.env.NEXT_PUBLIC_RPC_HTTP_URL || 'http://127.0.0.1:8545'
  } else {
    return process.env.NEXT_PUBLIC_RPC_HTTP_URL || 'https://mainnet.base.org'
  }
}

const rpcUrl = getRpcUrl()

// Configure wagmi with only the active chain and its RPC
export const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(rpcUrl),
  },
})


