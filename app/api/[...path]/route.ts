import { NextRequest } from "next/server";

export const runtime = "nodejs";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function removeCookieDomain(setCookieValue: string) {
  return setCookieValue.replace(/;\s*Domain=[^;]*/gi, "");
}

function buildUpstreamUrl(request: NextRequest, path: string[]) {
  const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!configuredBase || configuredBase.trim().length === 0) {
    return null;
  }

  const base = stripTrailingSlash(configuredBase.trim());
  const joinedPath = path.join("/");
  const query = request.nextUrl.search;
  return `${base}/api/${joinedPath}${query}`;
}

async function proxyToUpstream(request: NextRequest, path: string[]) {
  const upstreamUrl = buildUpstreamUrl(request, path);

  if (!upstreamUrl) {
    return new Response(
      JSON.stringify({ ok: false, message: "NEXT_PUBLIC_API_BASE_URL is not configured" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const hasBody = METHODS_WITH_BODY.has(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("set-cookie");

  const getSetCookie = (upstreamResponse.headers as Headers & {
    getSetCookie?: () => string[];
  }).getSetCookie;
  const setCookieValues =
    typeof getSetCookie === "function" ? getSetCookie.call(upstreamResponse.headers) : [];

  if (setCookieValues.length > 0) {
    for (const setCookieValue of setCookieValues) {
      responseHeaders.append("set-cookie", removeCookieDomain(setCookieValue));
    }
  } else {
    const singleSetCookie = upstreamResponse.headers.get("set-cookie");

    if (singleSetCookie) {
      responseHeaders.append("set-cookie", removeCookieDomain(singleSetCookie));
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToUpstream(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToUpstream(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToUpstream(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToUpstream(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToUpstream(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToUpstream(request, path);
}