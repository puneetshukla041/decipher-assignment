import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This forces Next.js to use the more compatible Webpack bundler 
  // instead of the native-binding-dependent Turbopack.
  transpilePackages: [], 
  /* config options here */
  
  // Note: If the error persists during 'npm run build', 
  // use the command: npx next build --webpack
};

export default nextConfig;