/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    experimental: {
        optimizeCss: true,
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false }
        return config
    },
}

module.exports = nextConfig