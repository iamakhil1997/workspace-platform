// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [{ hostname: "**" }],
    },
};
module.exports = nextConfig;
