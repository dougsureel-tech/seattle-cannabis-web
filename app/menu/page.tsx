import { redirect } from "next/navigation";

// Customer-facing menu lives on iHeartJane while we run on Dutchie POS / Springbig loyalty.
// When the in-house menu + checkout are ready (post-POS migration), revert this file
// from git history and the matching redirect at /order/page.tsx.
const IHEARTJANE_URL = "https://www.iheartjane.com/stores/5295/seattle-cannabis-co";

export const dynamic = "force-dynamic";

export default function MenuPage() {
  redirect(IHEARTJANE_URL);
}
