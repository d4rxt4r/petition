import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        reactCompiler: true,
        serverActions: {
            bodySizeLimit: '20mb',
        },
    },
};

export default nextConfig;
