/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "4dorgdbqpecohvog.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
  experimental: {
    serverMinification: false,
  },
};

export default config;
