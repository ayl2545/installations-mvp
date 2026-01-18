import type { Metadata } from "next";
import "./globals.css";
import DevAuth from "./components/DevAuth";

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
    <html lang="en">
      <body>
        <DevAuth />
        {children}
      </body>
    </html>
  );
}
