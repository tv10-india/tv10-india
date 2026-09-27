import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Script from "next/script";
import GoogleTranslateScript from "@/components/GoogleTranslateScript";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, SITE_LOGO, SITE_DESCRIPTION, SITE_SOCIALS } from "@/lib/site";
const inter = Inter({ subsets: ["latin"] });
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-8748522674365627";
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
<<<<<<< HEAD
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tv10-india.vercel.app").replace(/\/$/, "");
=======
const siteUrl = SITE_URL;

// Site-wide identity. Article pages reference the organisation by @id so the
// publisher is described once and reused.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsMediaOrganization",
      "@id": `${siteUrl}/#organization`,
      name: SITE_NAME,
      url: siteUrl,
      description: SITE_DESCRIPTION,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO,
      },
      sameAs: SITE_SOCIALS,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: SITE_NAME,
      url: siteUrl,
      inLanguage: "hi",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};
>>>>>>> 176d453 (Update V1.5)

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TV10 India",
    template: "%s | TV10 India",
  },
<<<<<<< HEAD
  description: "Latest breaking news from Uttar Pradesh, Uttarakhand, Delhi NCR and India. Get fast, trusted updates on politics, business, sports, and more.",
=======
  description: "TV10 India delivers the latest news from Uttar Pradesh, Uttarakhand, Delhi NCR and across India, covering politics, business, sports and more.",
>>>>>>> 176d453 (Update V1.5)
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "TV10 India",
    title: "TV10 India",
<<<<<<< HEAD
    description: "Latest breaking news from Uttar Pradesh, Uttarakhand, Delhi NCR and India.",
=======
    description: "TV10 India delivers the latest news from Uttar Pradesh, Uttarakhand, Delhi NCR and across India, covering politics, business, sports and more.",
>>>>>>> 176d453 (Update V1.5)
    images: [{ url: "/logo.png", alt: "TV10 India" }],
  },
  twitter: {
    card: "summary",
    title: "TV10 India",
<<<<<<< HEAD
    description: "Latest breaking news from Uttar Pradesh, Uttarakhand, Delhi NCR and India.",
=======
    description: "TV10 India delivers the latest news from Uttar Pradesh, Uttarakhand, Delhi NCR and across India, covering politics, business, sports and more.",
>>>>>>> 176d453 (Update V1.5)
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
        <JsonLd data={siteJsonLd} />

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
