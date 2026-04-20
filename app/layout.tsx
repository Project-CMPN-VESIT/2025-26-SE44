import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SevaConnect – Volunteer Management",
  description: "A professional platform for NGOs to track volunteer history, celebrate impact, and manage community records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ width: '100%', minHeight: '100vh' }}>
      <body style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
