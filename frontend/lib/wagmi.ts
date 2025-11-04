import { http, createConfig } from 'wagmi'
import { base, anvil } from 'wagmi/chains'

const chain = process.env.NEXT_PUBLIC_CHAIN_ID === '31337' ? anvil : base
const rpcUrl = process.env.NEXT_PUBLIC_RPC_HTTP_URL || 'https://mainnet.base.org'

export const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    31337: http(rpcUrl),
    8453: http(rpcUrl),
  },
})


