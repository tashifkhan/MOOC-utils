import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { NavHeader } from "@/components/nav-header";

// Fraunces: distinctive variable optical-size serif for display headings
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

// DM Sans: clean, humanist sans for body text
const dmSans = DM_Sans({
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
  title: {
    template: "%s | MOOC Utils",
    default: "MOOC Utils - AI-Powered NPTEL & SWAYAM Assignment Solver",
  },
  description:
    "Enhance your MOOC learning experience with MOOC Utils. Get AI-powered assignment help for NPTEL/SWAYAM and instant course notifications. The ultimate study companion for online learners.",
  keywords: [
    "MOOC",
    "NPTEL",
    "SWAYAM",
    "NPTEL Assignment Solver",
    "SWAYAM Assignment Helper",
    "AI Assignment Solver",
    "Course Notifications",
    "MOOC Utils",
    "Online Learning Tools",
    "Study Companion",
    "NPTEL Exam Preparation",
  ],
  authors: [{ name: "Tashif Khan", url: "https://github.com/tashifkhan" }],
  creator: "Tashif Khan",
  publisher: "MOOC Utils",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "MOOC Utils - AI-Powered NPTEL & SWAYAM Assignment Solver",
    description:
      "Get instant course notifications and AI-powered assignment help for NPTEL and SWAYAM courses. Ace your online certifications with ease.",
    url: "https://mooc-utils.tashif.codes",
    siteName: "MOOC Utils",
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://mooc-utils.tashif.codes"),
  twitter: {
    card: "summary_large_image",
    title: "MOOC Utils - AI-Powered NPTEL & SWAYAM Assignment Solver",
    description: "AI-powered assignment help and notifications for NPTEL & SWAYAM learners.",
    creator: "@tashifkhan",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
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
        className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <NavHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
