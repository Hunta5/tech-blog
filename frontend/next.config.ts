import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/auth/:path*',
                destination: 'http://backend:8080/auth/:path*',
            },
            // {
            //     source: '/api/auth/:path*',
            //     destination: 'http://localhost:8080/auth/:path*',
            // },
        ];
    },
};

export default nextConfig;
