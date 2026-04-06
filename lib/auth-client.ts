import { createAuthClient } from "better-auth/react";

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function resolveAuthBaseUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    "http://localhost:3000";

  return `${stripTrailingSlash(appBaseUrl)}/api/auth`;
}
console.log("Auth base URL:", resolveAuthBaseUrl());

export const authClient = createAuthClient({
  
  baseURL: resolveAuthBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

// NEXT_PUBLIC_API_BASE_URL= https://api.titgame.shop