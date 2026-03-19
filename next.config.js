/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true,
  },
  // BUG FIX: The original config had:
  //
  //   env: {
  //     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  //   }
  //
  // This bakes the fallback value into the compiled bundle at BUILD TIME.
  // When Vercel builds the project without NEXT_PUBLIC_API_URL set in its
  // environment variables, the fallback 'http://localhost:5000/api' gets
  // hard-coded into the JS bundle — and no amount of setting the variable
  // later in Vercel will fix it until the project is rebuilt.
  //
  // NEXT_PUBLIC_* variables are already handled natively by Next.js — they
  // are inlined at build time from the real environment automatically.
  // Wrapping them in next.config.js `env` with a fallback defeats this.
  //
  // FIX: Remove the env block entirely. Set NEXT_PUBLIC_API_URL in Vercel's
  // Environment Variables dashboard and trigger a redeploy. Next.js will
  // inline the correct value automatically.
  //
  // Required Vercel env var:
  //   NEXT_PUBLIC_API_URL = https://art-language-backend.onrender.com/api
}

module.exports = nextConfig
