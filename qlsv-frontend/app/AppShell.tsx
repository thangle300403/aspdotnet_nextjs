"use client";

import { usePathname } from "next/navigation";
import NavTabs from "./NavTabs";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <NavTabs />
      <div className="p-6">{children}</div>
    </>
  );
}
