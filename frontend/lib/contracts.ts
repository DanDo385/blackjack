export const addresses = {
  factory: '0x851356ae760d987E095750cCeb3bC6014560891C',
  table: '0xB955b6c65Ff69bfe07A557aa385055282b8a5eA3',
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
