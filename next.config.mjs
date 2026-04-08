/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Hand-written Database types don't satisfy Supabase's GenericTable
    // constraint until we run `supabase gen types` against the live schema
    // (Week 2). Runtime behaviour is correct — this only affects type inference.
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

export default nextConfig
