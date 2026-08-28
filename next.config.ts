/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },
};

export default nextConfig;
