import "./globals.css";
import AppShell from "./AppShell";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
