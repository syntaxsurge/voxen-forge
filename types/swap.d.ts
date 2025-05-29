export interface SwapToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  hasLogo?: boolean;
  balance?: string;
}
