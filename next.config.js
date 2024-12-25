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
    compiler: {
        // emotion이나 styled-components를 사용하는 경우에만 필요
        // styledComponents: true,
    },
}

module.exports = nextConfig