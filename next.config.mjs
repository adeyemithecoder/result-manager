/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["utfs.io", "img.clerk.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        hostname: "utfs.io",
        port: "",
      },
    ],
  },
};

export default nextConfig;
