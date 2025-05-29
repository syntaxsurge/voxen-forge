export type OkxBridgeRaw = {
  bridgeId: number;
  bridgeName: string;
  requireOtherNativeFee?: boolean;
  requiredOtherNativeFee?: boolean;
  logoUrl?: string;
  logo?: string;
  supportedChains?: string[];
};

export interface OkxBridgeResponse {
  code: string;
  msg: string;
  data: OkxBridgeRaw[];
}

export type PairRaw = {
  fromChainIndex: string;
  toChainIndex: string;
  fromChainId: string;
  toChainId: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromTokenSymbol: string;
  toTokenSymbol: string;
  pairId: string;
};

export interface OkxPairsResponse {
  code: string;
  msg: string;
  data: PairRaw[];
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  chainIndex: string;
  chainId: string;
  hasLogo?: boolean;
}

export interface Bridge {
  bridgeId: number;
  bridgeName: string;
  requireOtherNativeFee: boolean;
  logoUrl?: string;
  supportedChains: string[];
  supportsSolana: boolean;
}

export interface CrossChainSwapParams {
  fromChainIndex: string;
  toChainIndex: string;
  fromChainId: string;
  toChainId: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  slippage: string;
  userWalletAddress: string;
  sort?: string;
  dexIds?: string;
  allowBridge?: number[];
  denyBridge?: number[];
  receiveAddress?: string;
  feePercent?: string;
  referrerAddress?: string;
  priceImpactProtectionPercentage?: string;
  onlyBridge?: boolean;
  memo?: string;
}

export interface CrossChainSwapResult {
  success: boolean;
  action: string;
  timestamp: string;
  fromChain: string;
  toChain: string;
  code: string;
  data: Array<{
    fromTokenAmount: string;
    toTokenAmount: string;
    minmumReceive: string;
    router: {
      bridgeId: number;
      bridgeName: string;
      otherNativeFee: string;
      crossChainFee: string;
      crossChainFeeTokenAddress: string;
    };
    tx: {
      data: string;
      from: string;
      to: string;
      value: string;
      gasLimit: string;
      gasPrice: string;
      maxPriorityFeePerGas?: string;
    };
  }>;
  msg: string;
}
