/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This is the wildcard for all domains
      },
    ],
  },
};

export default nextConfig;