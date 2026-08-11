/**
 * Branded AppSumo webhook: https://www.protocol100.xyz/v2/webhooks
 *
 * Always returns AppSumo's required { event, success: true } so Partner Portal
 * validation succeeds even if Convex is briefly unavailable. Real events are
 * best-effort forwarded to Convex for license persistence.
 */
export const config = { runtime: "edge" };

function convexSiteUrl(): string | null {
  const site = process.env.CONVEX_SITE_URL || process.env.VITE_CONVEX_SITE_URL;
  return site ? site.replace(/\/$/, "") : null;
}

function parsePayload(rawBody: string, contentType: string): Record<string, unknown> {
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(rawBody);
    const payload: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) {
      if (value === "true") payload[key] = true;
      else if (value === "false") payload[key] = false;
      else if (value !== "" && !Number.isNaN(Number(value)) && /^-?\d+(\.\d+)?$/.test(value)) {
        payload[key] = Number(value);
      } else {
        payload[key] = value;
      }
    }
    return payload;
  }

  if (!rawBody.trim()) return {};
  return JSON.parse(rawBody) as Record<string, unknown>;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const rawBody = await request.text();

  let event = "purchase";
  let payload: Record<string, unknown> = {};
  try {
    payload = parsePayload(rawBody, contentType);
    if (typeof payload.event === "string" && payload.event.length > 0) {
      event = payload.event;
    }
  } catch (err) {
    console.error("[AppSumo webhook] Failed to parse body:", err);
    // Still acknowledge so Partner Portal can validate the URL
    return new Response(JSON.stringify({ event: "activate", success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Best-effort forward to Convex (never fail the AppSumo response)
  const site = convexSiteUrl();
  if (site) {
    try {
      const headers = new Headers({ "Content-Type": "application/json" });
      const signature = request.headers.get("X-Appsumo-Signature");
      const timestamp = request.headers.get("X-Appsumo-Timestamp");
      if (signature) headers.set("X-Appsumo-Signature", signature);
      if (timestamp) headers.set("X-Appsumo-Timestamp", timestamp);

      const upstream = await fetch(`${site}/webhook/appsumo`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!upstream.ok) {
        const text = await upstream.text();
        console.warn(
          `[AppSumo webhook] Convex forward ${upstream.status}: ${text.slice(0, 200)}`,
        );
      }
    } catch (err) {
      console.error("[AppSumo webhook] Convex forward failed:", err);
    }
  } else {
    console.warn("[AppSumo webhook] CONVEX_SITE_URL not set — acknowledged without forward");
  }

  return new Response(JSON.stringify({ event, success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
