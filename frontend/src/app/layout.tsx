import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "FastElit - Game Account Marketplace",
  description: "Buy and sell premium game accounts securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-background text-foreground antialiased"
      >
        <LanguageProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
