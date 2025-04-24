/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://nginx_proxy/api/:path*", // internal Docker network
      },
    ];
  },
};

export default nextConfig;
