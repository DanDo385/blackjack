/**
 * Smart contract addresses on Base mainnet / Anvil local network
 *
 * Note: These addresses should be imported from deployed contract artifacts
 * in a production environment. See contracts/broadcast/ for deployment info.
 */
export const addresses = {
  factory: '0x9d4454B023096f34B160D6B654540c56A1F81688',  // DeployFactory
  table: '0xBeaAFDA2E17fC95E69Dc06878039d274E0d2B21A',    // BlackjackTable
  treasury: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Treasury
} as const

/**
 * Contract ABIs for frontend interaction
 *
 * Note: Currently contains minimal ABI definitions. Should be expanded to include:
 * - Full Table contract ABI with all game functions
 * - Factory contract ABI for table creation
 * - Treasury contract ABI for fund management
 * - All event definitions for real-time game updates
 *
 * TODO: Generate ABIs from contract artifacts using TypeChain or similar
 * See: contracts/out/BlackjackTable.sol/BlackjackTable.json for full ABI
 */
export const abis = {
  table: [
    {
      type: "function",
      name: "placeBet",
      inputs: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "usdcRef", type: "uint256" },
        { name: "quoteId", type: "bytes32" },
      ],
      outputs: [{ type: "uint256" }],
    },
    {
      type: "function",
      name: "settle",
      inputs: [{ name: "handId", type: "uint256" }],
      outputs: [],
    },
    // TODO: Add more functions:
    // - hit(handId: uint256)
    // - stand(handId: uint256)
    // - split(handId: uint256)
    // - double(handId: uint256)
    // - insurance(handId: uint256, buy: bool)
    // - getGameState(handId: uint256)
    // - getPlayerStats(player: address)
  ] as const,
} as const
