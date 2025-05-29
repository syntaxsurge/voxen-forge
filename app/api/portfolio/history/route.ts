import { ok, handleError } from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";
import { compact } from "@/lib/utils";
import { assertRequired } from "@/lib/validation";
import type { TransactionHistoryRequestBody } from "@/types/api/portfolio";

export async function POST(request: Request) {
  try {
    const body: TransactionHistoryRequestBody = await request.json();

    assertRequired(body as any, ["address"]);

    const params = compact({
      address: body.address,
      chains: body.chains,
      tokenContractAddress: body.tokenContractAddress,
      begin: body.begin,
      end: body.end,
      cursor: body.cursor,
      limit: body.limit,
    });

    const data = await signedGet(
      "/api/v5/dex/post-transaction/transactions-by-address",
      params,
    );

    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
