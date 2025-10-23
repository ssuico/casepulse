import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Exclude worker directory from webpack bundling
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'worker': 'commonjs worker',
      });
    }
    return config;
  },
};

export default nextConfig;
