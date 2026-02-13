import type { Metadata, Viewport } from "next";
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
  title: "Executive Assistant | Voice-First AI Dashboard",
  description: "Your intelligent voice-first executive assistant powered by Vocal Bridge AI",
  keywords: ["AI", "Voice Assistant", "Executive Assistant", "Real-time", "WebRTC"],
  authors: [{ name: "Vocal Bridge" }],
};

export const viewport: Viewport = {
  themeColor: "#030712",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-mesh min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
