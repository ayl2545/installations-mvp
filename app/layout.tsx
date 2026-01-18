import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "Installations MVP",
  description: "Metal factory installations management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
