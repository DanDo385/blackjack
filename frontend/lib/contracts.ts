export const addresses = {
  factory: '0xFactory...',
  tableStd: '0xTableStd...',
  tablePrem: '0xTablePrem...',
  treasury: '0xTreasury...',
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


