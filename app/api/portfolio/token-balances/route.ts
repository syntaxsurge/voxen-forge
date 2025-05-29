import { ok, handleError } from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";
import { compact } from "@/lib/utils";
import { assertRequired } from "@/lib/validation";
import type { TokenBalancesRequestBody } from "@/types/api/portfolio";

function normaliseAsset(raw: any): any {
  const symbol = (raw.symbol ?? raw.tokenSymbol ?? "").toUpperCase();
  let balance = Number(raw.balance ?? 0);

  if (!balance && raw.nativeBalance !== undefined) {
    const nativeBal = Number(raw.nativeBalance);
    const decimals = Number(raw.decimals ?? 0);
    if (nativeBal && decimals >= 0) balance = nativeBal / 10 ** decimals;
  }

  return { ...raw, symbol, balance: balance.toString() };
}

export async function POST(request: Request) {
  try {
    const body: TokenBalancesRequestBody = await request.json();

    assertRequired(body as any, ["address", "chains"]);

    const params = compact({
      accountId: body.address,
      address: body.address,
      chains: body.chains,
      excludeRiskToken: body.excludeRiskToken,
    });

    const upstream = await signedGet(
      "/api/v5/dex/balance/all-token-balances-by-address",
      params,
    );

    if (Array.isArray(upstream?.data)) {
      upstream.data = upstream.data.map((chainItem: any) => {
        if (Array.isArray(chainItem?.tokenAssets)) {
          chainItem.tokenAssets = chainItem.tokenAssets.map(normaliseAsset);
        }
        return chainItem;
      });
    }

    return ok(upstream);
  } catch (error) {
    return handleError(error);
  }
}
