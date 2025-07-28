import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/auth/register",
        permanent: true,
      },
    ];
  },
  // Move these keys to the root level
  appDir: true,
  serverExternalPackages: ["bcrypt", "aws-sdk"],

  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
    };

    // Alias mock-aws-s3 to false if you're not using it.
    config.resolve.alias = {
      ...config.resolve.alias,
      "mock-aws-s3": false,
    };

    if (isServer) {
      // For server bundles, ignore aws-sdk so that it isn't processed by webpack.
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^aws-sdk$/ }));
    } else {
      // For the client, ensure aws-sdk isn't bundled.
      config.resolve.alias["aws-sdk"] = false;
    }

    return config;
  },
};

export default nextConfig;
