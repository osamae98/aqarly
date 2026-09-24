import { dirname, join } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship untranspiled JSX, so Next has to compile them.
  transpilePackages: ["@aqarly/ui", "@aqarly/core"],
  // Which app this is, for signing in: the account a phone opens here, and
  // the name of this app's session cookie (packages/core/src/auth.ts).
  env: {
    AQARLY_APP: "field",
  },
  // A deployed staging copy (STAGING_PASSWORD set) is open to anyone with the
  // link, so ask search engines not to list it. Locally, nothing changes.
  async headers() {
    if (!process.env.STAGING_PASSWORD) return [];
    return [
      { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
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
