import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Homie · Chấm công nội bộ",
  description:
    "Không báo nghỉ = đi làm. Quản lý ngày nghỉ và ngày công của nhân viên.",
  appleWebApp: { capable: true, title: "Homie", statusBarStyle: "default" },
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#c9343e",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
