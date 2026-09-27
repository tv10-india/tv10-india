/** @type {import('next').NextConfig} */
const nextConfig = {
  // `X-Powered-By: Next.js` tells an attacker which framework CVEs to try and
  // buys nothing in return.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // Serve images directly from Sanity's CDN, which does its own resizing.
    loader: 'custom',
    loaderFile: './sanityImageLoader.ts',
<<<<<<< HEAD
=======
  },
  async headers() {
    return [
      {
        // Every route, including files served straight out of `public/`.
        source: '/:path*',
        headers: [
          // Stops the browser second-guessing Content-Type. Matters most for
          // /api/proxy-image, which replays bytes fetched from Sanity's CDN.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Full URL to our own pages, bare origin to everyone else.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Clickjacking: nobody frames TV10 but TV10. X-Frame-Options is the
          // legacy spelling and frame-ancestors the one current browsers read,
          // so both are sent. frame-ancestors is the only CSP directive set
          // here on purpose — a full policy would have to enumerate AdSense,
          // Google Analytics and the Studio, and one missed host is a blank page.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          // Only the features a news site never legitimately needs are named.
          // Anything unnamed keeps its browser default deliberately: naming the
          // ad-targeting features here would switch off AdSense's targeting.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
>>>>>>> 176d453 (Update V1.5)
  },
};

export default nextConfig;
