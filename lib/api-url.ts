function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function resolveApiOrigin() {
  if (typeof window !== "undefined") {
    return stripTrailingSlash(window.location.origin);
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    "http://localhost:3000";

  return stripTrailingSlash(appUrl);
}

export function toApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiOrigin()}${normalizedPath}`;
}