import { TOKEN_ADDRESS_MAP, CHAIN_INDEX_MAP } from "@/lib/ai/chat-utils";
import { ok, badRequest, handleError } from "@/lib/http-response";
import { signedPost, signedGet } from "@/lib/network/okx-signed";
import { compact } from "@/lib/utils";
import type { SpecificTokenBalanceRequestBody } from "@/types/api/portfolio";

const isNativeSol = (
  addrs: SpecificTokenBalanceRequestBody["tokenContractAddresses"],
): boolean =>
  Array.isArray(addrs) &&
  addrs.length === 1 &&
  addrs[0].chainIndex === CHAIN_INDEX_MAP["SOL"] &&
  addrs[0].tokenContractAddress === TOKEN_ADDRESS_MAP["SOL"];

export async function POST(request: Request) {
  try {
    const body: SpecificTokenBalanceRequestBody = await request.json();

    if (
      !body.address ||
      !Array.isArray(body.tokenContractAddresses) ||
      body.tokenContractAddresses.length === 0
    ) {
      return badRequest(
        "Missing or invalid required parameters: address and tokenContractAddresses",
      );
    }

    if (isNativeSol(body.tokenContractAddresses)) {
      const params = compact({
        accountId: body.address,
        address: body.address,
        chains: CHAIN_INDEX_MAP["SOL"],
        excludeRiskToken: body.excludeRiskToken,
      });

      const upstream = await signedGet(
        "/api/v5/dex/balance/all-token-balances-by-address",
        params,
      );

      const tokenAssets =
        upstream?.data?.[0]?.tokenAssets?.filter(
          (a: any) => (a.symbol ?? a.tokenSymbol ?? "").toUpperCase() === "SOL",
        ) ?? [];

      return ok({ data: [{ ...upstream.data?.[0], tokenAssets }] });
    }

    const payload = {
      address: body.address,
      tokenContractAddresses: body.tokenContractAddresses,
      ...compact({ excludeRiskToken: body.excludeRiskToken }),
    };

    const data = await signedPost(
      "/api/v5/dex/balance/token-balances-by-address",
      payload,
    );

    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
