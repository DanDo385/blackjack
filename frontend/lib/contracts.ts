export const addresses = {
  factory: '0x9d4454B023096f34B160D6B654540c56A1F81688',
  tableStd: '0xBeaAFDA2E17fC95E69Dc06878039d274E0d2B21A',
  tablePrem: '0xdf077F5F72071dF6e8B0a78071E496bA17b5Ee0c',
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
