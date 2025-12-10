/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // This tells Next.js to let Sanity handle the image resizing
    // It fixes the "Private IP" error instantly.
    unoptimized: true, 
  },
};

export default nextConfig;