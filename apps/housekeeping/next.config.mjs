import { dirname, join } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship untranspiled JSX, so Next has to compile them.
  transpilePackages: ["@aqarly/ui", "@aqarly/core"],
  // Pin the workspace root so Next doesn't walk up and adopt an unrelated
  // lockfile from a parent directory.
  turbopack: {
    root: join(dirname(import.meta.dirname), ".."),
  },
  experimental: {
    serverActions: {
      // Server Actions default to a 1MB body, which the per-file caps in
      // apps/housekeeping/src/app/actions.js already guard against — this just keeps
      // the framework's own cap from being the thing that rejects a request.
      bodySizeLimit: "1gb",
    },
  },
};

export default nextConfig;
