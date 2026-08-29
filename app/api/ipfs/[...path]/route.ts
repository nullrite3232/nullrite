const IPFS_GATEWAYS = [
  "https://w3s.link/ipfs/",
  "https://dweb.link/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
] as const;

const UPSTREAM_TIMEOUT_MS = 10_000;

function buildUpstreamUrl(gateway: string, path: string[]) {
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  return `${gateway}${encodedPath}`;
}

async function fetchFromGateway(gateway: string, path: string[], range: string | null) {
  const headers = new Headers();
  if (range) headers.set("range", range);

  const response = await fetch(buildUpstreamUrl(gateway, path), {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`IPFS gateway returned ${response.status}`);
  }

  return response;
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path;

  if (!Array.isArray(path) || path.length === 0) {
    return new Response("Missing IPFS path.", { status: 400 });
  }

  try {
    const range = request.headers.get("range");
    const upstream = await Promise.any(
      IPFS_GATEWAYS.map((gateway) => fetchFromGateway(gateway, path, range))
    );

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");

    if (contentType) headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);
    if (contentRange) headers.set("content-range", contentRange);
    if (acceptRanges) headers.set("accept-ranges", acceptRanges);
    headers.set("cache-control", "public, max-age=31536000, immutable");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return new Response("IPFS content is temporarily unavailable.", {
      status: 502,
      headers: {
        "cache-control": "no-store",
      },
    });
  }
}
