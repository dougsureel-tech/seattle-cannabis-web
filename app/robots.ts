import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

// Cannabis is regulated content. Some bot allowlists default to blocking
// regulated verticals — explicit allow ensures Claude / ChatGPT / Atlas /
// Perplexity / Gemini / Apple Intelligence can crawl and cite us. WAC +
// WSLCB compliance is preserved by content alone (no medical claims,
// no advertising-style copy on /llms-full.txt or /llms.txt) — not by
// hiding from crawlers.
//
// Companion artifacts:
//   /llms.txt       short index (Anthropic-proposed standard)
//   /llms-full.txt  long-form factual reference for citation
//   /sitemap.xml    full URL list for traditional crawlers

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default crawler — Google, Bing, the long tail. /account is
      // user-specific (no SEO value). /api is internal noise; /sign-in
      // + /sign-up are auth pages. /rewards/* is the SpringBig-cutover
      // PWA (auth-gated, per-customer). /stash is a per-visitor
      // localStorage view. /quiz/unsubscribe is a post-action surface.
      // Page-level noindex already handles indexing but adding here
      // saves the crawl request entirely.
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/api/",
          "/order/confirmation/", // v8.825 — per-order privacy. Sister
                                  // glw v7.685.
          "/quiz/unsubscribe",
          "/rewards",
          "/sign-in",
          "/sign-up",
          "/stash",
        ],
      },
      // ── AI search engines — explicit allow ─────────────────────────
      // OpenAI: ChatGPT (incl. browse mode + Atlas)
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      // Anthropic: Claude (incl. claude.ai search + claude-haiku citations)
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      // Perplexity (incl. browse mode)
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      // Google Gemini (Bard) — Google-Extended is the opt-in flag for
      // Gemini training data; without it Gemini may train on the page
      // anyway but won't cite freshly.
      { userAgent: "Google-Extended", allow: "/" },
      // Apple Intelligence (iOS 18+ Siri + system-wide writing tools)
      { userAgent: "Applebot-Extended", allow: "/" },
      // Meta AI (FB/IG/WhatsApp)
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      // ByteDance / Doubao
      { userAgent: "Bytespider", allow: "/" },
      // Common Crawl — training data feedstock for many smaller LLMs
      { userAgent: "CCBot", allow: "/" },
      // Diffbot — citation source for several enterprise AI engines
      { userAgent: "Diffbot", allow: "/" },
      // Yandex / Russian-language AI
      { userAgent: "YandexBot", allow: "/" },
      // Cohere
      { userAgent: "cohere-ai", allow: "/" },
      // Mistral
      { userAgent: "MistralAI-User", allow: "/" },
    ],
    sitemap: `${STORE.website}/sitemap.xml`,
    host: STORE.website,
  };
}
