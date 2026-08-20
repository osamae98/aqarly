/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root — otherwise Next walks up and picks up an unrelated
  // package-lock.json from a parent directory.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
