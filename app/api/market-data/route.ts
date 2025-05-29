import { ok, badRequest, handleError } from "@/lib/http-response";
import { signedGet, signedPost } from "@/lib/network/okx-signed";

export async function POST(request: Request) {
  try {
    const { method, path, data } = await request.json();

    if (!method || !path) {
      return badRequest("Missing required parameters: method and path");
    }

    const upperMethod = String(method).toUpperCase() as "GET" | "POST";
    if (upperMethod !== "GET" && upperMethod !== "POST") {
      return badRequest("method must be GET or POST");
    }

    let result;
    if (upperMethod === "GET") {
      const params =
        data && typeof data === "object" && !Array.isArray(data)
          ? (data as Record<string, string>)
          : {};
      result = await signedGet<any>(path, params);
    } else {
      result = await signedPost<any>(path, data);
    }

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
