import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:8080/:path*',  // ✅ 使用容器名
            },
        ];
    },
};

export default nextConfig;
