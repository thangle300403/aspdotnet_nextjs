"use client";

import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_CHANGED_EVENT = "auth-changed";
const SESSION_EXPIRED_MESSAGE =
  "Access token da het han. Vui long dang nhap lai.";
const MISSING_TOKEN_MESSAGE = "Khong co access token. Vui long dang nhap lai.";
const MISSING_REFRESH_TOKEN_MESSAGE = "Vui long dang nhap lai.";
const DEFAULT_REDIRECT_PATH = "/students";

let hasShownSessionExpiredToast = false;
let refreshPromise: Promise<string> | null = null;

export function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function dispatchAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function resetSessionExpiredToast() {
  hasShownSessionExpiredToast = false;
}

export function subscribeAuthChanged(callback: () => void) {
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, callback);
}

function clearStoredAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("loggedInEmail");
}

function redirectTo(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== path) {
    window.location.assign(path);
  }
}

export function requireAccessToken(redirectToPath = DEFAULT_REDIRECT_PATH) {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    redirectTo(redirectToPath);
    throw new Error(MISSING_TOKEN_MESSAGE);
  }

  return accessToken;
}

async function parseJsonSafely(response: Response) {
  try {
    return (await response.json()) as {
      message?: string;
      accessToken?: string;
    };
  } catch {
    return {};
  }
}

async function requestNewAccessToken() {
  const response = await fetch(buildApiUrl("/api/auth/refresh"), {
    method: "POST",
    credentials: "include",
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || !data.accessToken) {
    throw new Error(data.message || SESSION_EXPIRED_MESSAGE);
  }

  localStorage.setItem("accessToken", data.accessToken);
  dispatchAuthChanged();
  resetSessionExpiredToast();
  return data.accessToken;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const accessToken = requireAccessToken();

  const createHeaders = (token: string) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  };

  let response = await fetch(buildApiUrl(path), {
    ...init,
    headers: createHeaders(accessToken),
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    const newAccessToken = await refreshAccessToken();
    response = await fetch(buildApiUrl(path), {
      ...init,
      headers: createHeaders(newAccessToken),
    });

    if (response.status !== 401) {
      return response;
    }
  } catch (error) {
    clearStoredAuth();
    dispatchAuthChanged();
    redirectTo(DEFAULT_REDIRECT_PATH);
    if (!hasShownSessionExpiredToast) {
      hasShownSessionExpiredToast = true;
      toast.error(
        error instanceof Error ? error.message : SESSION_EXPIRED_MESSAGE,
      );
    }

    throw error;
  }

  if (!hasShownSessionExpiredToast) {
    hasShownSessionExpiredToast = true;
    toast.error(SESSION_EXPIRED_MESSAGE);
  }

  clearStoredAuth();
  dispatchAuthChanged();
  redirectTo(DEFAULT_REDIRECT_PATH);
  throw new Error(SESSION_EXPIRED_MESSAGE);
}

export async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { message?: string };
      return data.message || fallbackMessage;
    }

    const text = await response.text();
    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export {
  API_BASE_URL,
  MISSING_REFRESH_TOKEN_MESSAGE,
  MISSING_TOKEN_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
};
