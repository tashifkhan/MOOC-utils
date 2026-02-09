import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { NavHeader } from "@/components/nav-header";

// Using Outfit for a modern, geometric display font
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MOOC Utils - Your MOOC Superpower Suite",
  description:
    "Tools for MOOC learners: Get instant course notifications and AI-powered assignment help for NPTEL and SWAYAM courses.",
  keywords: [
    "MOOC",
    "NPTEL",
    "SWAYAM",
    "course notifications",
    "assignment helper",
    "browser extension",
  ],
  openGraph: {
    title: "MOOC Utils - Your MOOC Superpower Suite",
    description:
      "Get instant course notifications and AI-powered assignment help for NPTEL and SWAYAM courses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <NavHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
