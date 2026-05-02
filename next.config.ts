import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // TEMPORARY workaround: Jane Boost embed at /menu renders blank because
  // iHeartJane hasn't provisioned a working Boost config for store 5295
  // (current `embedConfigId: 222` in app/menu/page.tsx appears to be wrong
  // or unactivated — Wenatchee with config 234 hydrates fine, Seattle with
  // 222 silently fails). Customers were getting a blank menu page.
  //
  // Bouncing /menu to iheartjane.com directly so customers can shop until
  // iHeartJane partner support gives us the real Boost config for 5295.
  // When that lands: update embedConfigId in app/menu/page.tsx, smoke-test
  // the embed, then DELETE this redirects() block. The JaneMenu component
  // is intentionally left in place so swapping back is a 1-line config diff.
  async redirects() {
    return [
      {
        source: "/menu",
        destination: "https://www.iheartjane.com/stores/5295/seattle-cannabis-co",
        permanent: false,
        basePath: false,
      },
      {
        source: "/order",
        destination: "https://www.iheartjane.com/stores/5295/seattle-cannabis-co",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
