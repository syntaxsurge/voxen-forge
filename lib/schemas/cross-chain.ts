import type { ValidationSchema } from "@/lib/validation";

export const CrossChainSwapSchema: ValidationSchema = {
  fromChainIndex: { required: true, numeric: true },
  toChainIndex: { required: true, numeric: true },
  fromChainId: { required: true },
  toChainId: { required: true },
  fromTokenAddress: { required: true },
  toTokenAddress: { required: true },
  amount: { required: true, numeric: true },
  slippage: { required: true, numeric: true, min: 0.002, max: 0.5 },
  userWalletAddress: { required: true },
  sort: {},
  dexIds: {},
  allowBridge: {},
  denyBridge: {},
  receiveAddress: {},
  feePercent: {},
  referrerAddress: {},
  priceImpactProtectionPercentage: {},
  onlyBridge: {},
  memo: {},
};

export const BridgeTokenPairSchema: ValidationSchema = {
  fromChainIndex: { numeric: true },
};
