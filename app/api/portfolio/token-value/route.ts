import { ok, badRequest, handleError } from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";
import { compact } from "@/lib/utils";
import type { TotalValueQuery } from "@/types/api/portfolio";

export async function POST(request: Request) {
  try {
    const body: TotalValueQuery = await request.json();

    if (!body.address) {
      return badRequest("Missing required parameter: address");
    }

    const params = compact({
      address: body.address,
      chains: body.chains,
      assetType: body.assetType,
      excludeRiskToken: body.excludeRiskToken,
    });

    const apiRes = await signedGet(
      "/api/v5/wallet/asset/total-value-by-address",
      params,
    );

    const first =
      Array.isArray(apiRes?.data) && apiRes.data.length
        ? apiRes.data[0]
        : (apiRes.data ?? {});

    return ok({ totalValue: first?.totalValue ?? null });
  } catch (error) {
    return handleError(error);
  }
}
