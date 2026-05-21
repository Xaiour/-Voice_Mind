import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/providers/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VoiceMind — AI Voice Analysis for Mental Health",
  description:
    "AI-powered voice analysis platform for mental health professionals. Decode your mental frequencies with anti-gravity UI.",
  keywords: ["voice analysis", "mental health", "AI", "therapy", "emotions"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen`} style={{ backgroundColor: "#050510" }}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
