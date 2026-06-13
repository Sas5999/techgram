import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Techgram — Tech Intelligence Feed",
  description: "Swipe through curated tech news, AI insights, funding rounds, and market disruptions in seconds.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Techgram — Tech Intelligence Feed",
    description: "Swipe through curated tech news, AI insights, funding rounds, and market disruptions in seconds.",
    url: "https://incandescent-basbousa-4872c0.netlify.app",
    siteName: "Techgram",
    images: [
      {
        url: "https://incandescent-basbousa-4872c0.netlify.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Techgram — Tech Intelligence Feed",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Techgram — Tech Intelligence Feed",
    description: "Swipe through curated tech news, AI insights, funding rounds, and market disruptions in seconds.",
    images: ["https://incandescent-basbousa-4872c0.netlify.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}