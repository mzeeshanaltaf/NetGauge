import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // /embed exists to be <iframe>'d by other sites — allow framing from
        // any origin. Next sets no X-Frame-Options by default, so this is
        // belt-and-suspenders documentation of that intent, not a fix.
        source: "/embed",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
    ];
  },
};

export default nextConfig;
