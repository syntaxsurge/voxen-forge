export interface TransactionHistoryRequestBody {
  address: string;
  chains?: string;
  tokenContractAddress?: string;
  begin?: string;
  end?: string;
  cursor?: string;
  limit?: string;
}

export interface TokenContractAddress {
  chainIndex: string;
  tokenContractAddress: string;
}

export interface SpecificTokenBalanceRequestBody {
  address: string;
  tokenContractAddresses: TokenContractAddress[];
  excludeRiskToken?: "0" | "1";
}

export interface TotalValueQuery {
  address: string;
  chains?: string;
  assetType?: "0" | "1" | "2";
  excludeRiskToken?: string;
}

export interface TokenBalancesRequestBody {
  address: string;
  chains: string;
  excludeRiskToken?: "0" | "1";
}

export interface TxDetailByHashRequestBody {
  chainIndex: string;
  txHash: string;
  itype?: "0" | "1" | "2";
}
