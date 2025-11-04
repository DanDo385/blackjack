export const addresses = {
  factory: '0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650',
  tableStd: '0xcfe53426950562347a6D2B90bE99D98167eac32d',
  tablePrem: '0x0a26c41eB1D42981aD15d7D593789cC455B7Ae71',
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
