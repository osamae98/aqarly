import { dirname, join } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship untranspiled JSX, so Next has to compile them.
  transpilePackages: ["@aqarly/ui", "@aqarly/core"],
  // Data comes from aqarly-api via server-side `fetch` (packages/core/src/api.ts),
  // which the browser's Network tab never sees. In development, print each
  // one with its full URL in this app's terminal instead. Dev-only.
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Pin the workspace root so Next doesn't walk up and adopt an unrelated
  // lockfile from a parent directory.
  turbopack: {
    root: join(dirname(import.meta.dirname), ".."),
  },
};

export default nextConfig;
