/**
 * Branded AppSumo webhook alias: https://protocol100.xyz/webhook/appsumo
 * Prefer registering https://protocol100.xyz/v2/webhooks in the Partner Portal.
 */
export const config = { runtime: "edge" };

function convexSiteUrl(): string | null {
  const site = process.env.CONVEX_SITE_URL || process.env.VITE_CONVEX_SITE_URL;
  return site ? site.replace(/\/$/, "") : null;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  const site = convexSiteUrl();
  if (!site) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "CONVEX_SITE_URL (or VITE_CONVEX_SITE_URL) is not configured on Vercel",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const rawBody = await request.text();
  const headers = new Headers({ "Content-Type": "application/json" });
  const signature = request.headers.get("X-Appsumo-Signature");
  const timestamp = request.headers.get("X-Appsumo-Timestamp");
  if (signature) headers.set("X-Appsumo-Signature", signature);
  if (timestamp) headers.set("X-Appsumo-Timestamp", timestamp);

  try {
    const upstream = await fetch(`${site}/webhook/appsumo`, {
      method: "POST",
      headers,
      body: rawBody,
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream proxy failed";
    console.error("[AppSumo proxy] /webhook/appsumo:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
