import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Script from "next/script";
import GoogleTranslateScript from "@/components/GoogleTranslateScript";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TV10 India | Your Choice Your Voice",
  description: "Latest breaking news from Uttar Pradesh, Uttarakhand, Delhi NCR and India. Get fast, trusted updates on politics, business, sports, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleTranslateScript />

        {/* ADSENSE */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8748522674365627"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {children}
        <Footer />
      </body>
    </html>
  );
}
