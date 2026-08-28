import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Script from "next/script";
import GoogleTranslateScript from "@/components/GoogleTranslateScript";
const inter = Inter({ subsets: ["latin"] });
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-8748522674365627";
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tv10-india.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TV10 India",
    template: "%s | TV10 India",
  },
  description: "Latest breaking news from Uttar Pradesh, Uttarakhand, Delhi NCR and India. Get fast, trusted updates on politics, business, sports, and more.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "TV10 India",
    title: "TV10 India",
    description: "Latest breaking news from Uttar Pradesh, Uttarakhand, Delhi NCR and India.",
    images: [{ url: "/logo.png", alt: "TV10 India" }],
  },
  twitter: {
    card: "summary",
    title: "TV10 India",
    description: "Latest breaking news from Uttar Pradesh, Uttarakhand, Delhi NCR and India.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body className={inter.className}>
        <GoogleTranslateScript />

        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {googleAnalyticsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`}
            </Script>
          </>
        )}

        {children}
        <Footer />
      </body>
    </html>
  );
}
