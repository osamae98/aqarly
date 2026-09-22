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
      // Closing a job posts its photos, and the per-file caps in
      // apps/field/src/app/actions.js already guard the size — this just keeps
      // the framework's own 1MB default from being the thing that rejects it.
      bodySizeLimit: "1gb",
    },
  },
};

export default nextConfig;
