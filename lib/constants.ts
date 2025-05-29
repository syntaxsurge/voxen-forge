export const NATIVE_SOL_ADDRESS = "11111111111111111111111111111111";

export const chainList = [
  {
    name: "Ethereum",
    index: "1",
    id: "1",
    color: "from-blue-600 to-purple-600",
  },
  {
    name: "Solana",
    index: "501",
    id: "501",
    color: "from-purple-500 to-blue-500",
  },
  {
    name: "BNB Chain",
    index: "56",
    id: "56",
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "Polygon",
    index: "137",
    id: "137",
    color: "from-purple-600 to-pink-500",
  },
  {
    name: "Arbitrum",
    index: "42161",
    id: "42161",
    color: "from-blue-600 to-cyan-500",
  },
  {
    name: "Optimism",
    index: "10",
    id: "10",
    color: "from-red-500 to-pink-500",
  },
  {
    name: "Avalanche",
    index: "43114",
    id: "43114",
    color: "from-red-600 to-orange-500",
  },
  {
    name: "Fantom",
    index: "250",
    id: "250",
    color: "from-blue-400 to-cyan-400",
  },
];

export const routeOptions = [
  {
    value: "1",
    label: "Optimal Route",
    description: "Best balance of cost and speed",
  },
  { value: "0", label: "Most Tokens", description: "Maximum tokens received" },
  {
    value: "2",
    label: "Fastest Route",
    description: "Quickest execution time",
  },
];
