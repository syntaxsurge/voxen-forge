import { ok, badRequest, handleError } from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";
import { compact } from "@/lib/utils";
import { assertRequired } from "@/lib/validation";
import type { TxDetailByHashRequestBody } from "@/types/api/portfolio";

export async function POST(request: Request) {
  try {
    const body: TxDetailByHashRequestBody = await request.json();

    try {
      assertRequired(body as any, ["chainIndex", "txHash"]);
    } catch (e: any) {
      return badRequest(e.message);
    }

    const params = compact({
      chainIndex: body.chainIndex,
      txHash: body.txHash,
      itype: body.itype,
    });

    const data = await signedGet(
      "/api/v5/dex/post-transaction/transaction-detail-by-txhash",
      params,
    );

    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
