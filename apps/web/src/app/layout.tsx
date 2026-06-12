import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Techgram — Tech Intelligence Feed",
  description: "Swipe through curated tech news, AI insights, funding rounds, and market disruptions in seconds.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
