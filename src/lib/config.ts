export const config = {
  isTest: process.env.NODE_ENV === 'test',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  vercelUrl: process.env.VERCEL_URL,
}

export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  ...(config.isProd && {
    'Cache-Control': 'no-store',
    'X-Vercel-Protection': process.env.VERCEL_PROTECTION_TOKEN,
  }),
})
