import type { NextConfig } from "next";
import webpack from "webpack";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Add polyfill plugin for Node.js built-ins
    config.plugins?.push(new NodePolyfillPlugin());

    // Fix imports that use `node:` protocol
    config.plugins?.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );

    // Add fallbacks for Node.js built-ins
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: "process/browser",
      buffer: "buffer",
      assert: "assert",
      util: "util",
      url: "url",
      path: "path-browserify",
      fs: false, // Disable fs in the browser
    };

    return config;
  },
};

export default nextConfig;