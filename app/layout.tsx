import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ForceLightMode } from "@/components/force-light-mode";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PSSF Smart Self-Service Platform",
  description: "Public Service Superannuation Fund — secure, simple and faster pension self-service online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-[#111827] font-[family-name:var(--font-inter)]">
        <ForceLightMode />
        {children}
      </body>
    </html>
  );
}
