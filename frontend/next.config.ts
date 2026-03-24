import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/auth/:path*',
                destination: 'http://backend:8080/auth/:path*',
            },
            {
                source: '/api/news/:path*',
                destination: 'http://backend:8080/news/:path*',
            },
            {
                source: '/api/baidu-hot/:path*',
                destination: 'http://backend:8080/baidu-hot/:path*',
            },
            // {
            //     source: '/api/auth/:path*',
            //     destination: 'http://localhost:8080/auth/:path*',
            // },
        ];
    },
};

export default nextConfig;
