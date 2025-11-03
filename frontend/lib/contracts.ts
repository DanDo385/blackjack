export const addresses = {
  factory: '0x4826533B4897376654Bb4d4AD88B7faFD0C98528',
  tableStd: '0xca4211da53d1bbab819B03138302a21d6F6B7647',
  tablePrem: '0xE7402c51ae0bd667ad57a99991af6C2b686cd4f1',
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
