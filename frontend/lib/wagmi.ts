import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
export const wagmiConfig = createConfig({
  chains: [base],
  transports: { [base.id]: http(process.env.NEXT_PUBLIC_RPC_HTTP_URL!) },
})


