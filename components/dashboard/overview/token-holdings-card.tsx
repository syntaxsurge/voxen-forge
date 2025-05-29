"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displaySymbol, formatTokenAmount } from "@/lib/utils";

interface Props {
  tokenAssets: any[];
  loading: boolean;
}

export default function TokenHoldingsCard({ tokenAssets, loading }: Props) {
  return (
    <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
          Token Portfolio Snapshot ({tokenAssets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-white/60 text-center py-8">
              Loading token balances…
            </div>
          ) : tokenAssets.length === 0 ? (
            <div className="text-white/60 text-center py-8">
              No active token holdings found.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left pb-3 text-white/60">Token</th>
                  <th className="text-right pb-3 text-white/60">Balance</th>
                  <th className="text-right pb-3 text-white/60">Price</th>
                  <th className="text-right pb-3 text-white/60">Value</th>
                </tr>
              </thead>
              <tbody>
                {tokenAssets.slice(0, 10).map((asset: any) => {
                  const balanceNum = Number(asset.balance || 0);
                  const priceNum = Number(asset.tokenPrice || 0);
                  const key =
                    asset.tokenContractAddress ||
                    asset.address ||
                    `${asset.symbol}-${asset.chainIndex}`;
                  const symbol = displaySymbol(
                    asset.symbol,
                    asset.tokenContractAddress,
                  );
                  return (
                    <tr
                      key={key}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 font-medium text-white">{symbol}</td>
                      <td className="text-right py-4 text-white">
                        {formatTokenAmount(balanceNum)}
                      </td>
                      <td className="text-right py-4 text-white">
                        $
                        {priceNum.toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })}
                      </td>
                      <td className="text-right py-4 text-white font-medium">
                        ${formatTokenAmount(balanceNum * priceNum, 2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
