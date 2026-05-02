import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // TEMPORARY: redirect /menu to iHeartJane direct because Jane Boost is
  // not provisioned for store 5295 yet. We tried embedConfigId 234
  // (Wenatchee's), 222 (a guess) — both result in a blank page because
  // iHeartJane hasn't activated Boost for this store on their side.
  //
  // ACTION ITEM: Doug must email iHeartJane partner support requesting
  // Boost embed activation for store 5295 (Seattle Cannabis Co). They
  // will reply with a real embedConfigId.
  //
  // When that arrives: paste it into IHEARTJANE_EMBED_CONFIG_ID at
  // app/menu/page.tsx, smoke-test the embed, then DELETE this redirects()
  // block. JaneMenu.tsx + page.tsx are intact so the swap-back is one line.
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
