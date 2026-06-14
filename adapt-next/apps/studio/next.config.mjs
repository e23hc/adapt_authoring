/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compile the workspace packages from TypeScript source (no prebuild step in dev).
  transpilePackages: ["@adapt-next/renderer", "@adapt-next/content-schemas"],
  // ESLint is not configured in this MVP; type-checking still runs.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
