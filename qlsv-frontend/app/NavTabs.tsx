"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  dispatchAuthChanged,
  resetSessionExpiredToast,
  subscribeAuthChanged,
} from "../lib/authFetch";

const tabs = [
  { href: "/students", label: "Student" },
  { href: "/subjects", label: "Subject" },
  { href: "/registers", label: "Register" },
];

export default function NavTabs() {
  const pathname = usePathname();
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [hasAccessToken, setHasAccessToken] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setLoggedInEmail(localStorage.getItem("loggedInEmail") ?? "");
      setHasAccessToken(Boolean(localStorage.getItem("accessToken")));
    };

    syncAuthState();
    return subscribeAuthChanged(syncAuthState);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loggedInEmail");
    resetSessionExpiredToast();
    dispatchAuthChanged();
    toast.success("Đăng xuất thành công.");
    redirect("/students");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-4 text-slate-900 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link
            href="/students"
            className="text-sm font-semibold tracking-[0.3em] text-sky-700 uppercase"
          >
            QLSV
          </Link>

          <div className="flex gap-5">
            {tabs
              .filter((tab) => tab.href !== "/registers" || hasAccessToken)
              .map((tab) => {
                const isActive = pathname === tab.href;

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={
                      isActive
                        ? "text-sm font-semibold text-slate-900 underline underline-offset-4"
                        : "text-sm text-slate-500 transition hover:text-slate-900"
                    }
                  >
                    {tab.label}
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loggedInEmail ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {loggedInEmail}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
