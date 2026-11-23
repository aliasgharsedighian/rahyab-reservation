import { cookies } from "next/headers";
import { getSessionFailure } from "@/lib/api/session";
import { getApiUrl } from "@/lib/api/url";
import { isPushDeviceId } from "@/lib/push-device";

export async function POST(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return new Response(null, { status: 403 });
  const token = (await cookies()).get("user_token")?.value;
  if (!token) return new Response(null, { status: 401 });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return new Response(null, { status: 415 });
  }

  const body = await request.json().catch(() => null);
  if (!isPushDeviceId(body?.device_id) || body.platform !== "web") {
    return new Response(null, { status: 422 });
  }

  try {
    const response = await fetch(getApiUrl("push/installations"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_id: body.device_id, platform: "web" }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json().catch(() => null);
    if (response.status === 403 || getSessionFailure(response.status, result)) {
      return new Response(null, { status: 401 });
    }
    if (response.status === 422 || result?.status === 422) return new Response(null, { status: 422 });
    if (response.status === 200 && result?.success === true && result.status === 200) {
      return new Response(null, { status: 200 });
    }
  } catch {
    // The browser retries transient failures without interrupting login.
  }
  return new Response(null, { status: 502 });
}
