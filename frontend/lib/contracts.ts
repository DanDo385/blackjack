export const addresses = {
  factory: '0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f',
  tableStd: '0x465Df401621060aE6330C13cA7A0baa2B0a9d66D',
  tablePrem: '0xd79Df1927718b3212FA6E126Ec4Ad2b3Ee1263D9',
  treasury: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
} as const

export const abis = {
  table: [
    { "type":"function","name":"placeBet","inputs":[
      {"name":"token","type":"address"},
      {"name":"amount","type":"uint256"},
      {"name":"usdcRef","type":"uint256"},
      {"name":"quoteId","type":"bytes32"}],"outputs":[{"type":"uint256"}] },
    { "type":"function","name":"settle","inputs":[{"name":"handId","type":"uint256"}],"outputs":[] },
  ]
}
