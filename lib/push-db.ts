import "server-only";
import { getClient } from "./db";

const SITE = "seattle";

export type PushSubInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
  clerkUserId?: string | null;
};

export async function upsertPushSubscription(input: PushSubInput): Promise<void> {
  const sql = getClient();
  const id = `push_${SITE}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await sql`
    INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, user_agent, site, clerk_user_id, last_used_at)
    VALUES (
      ${id}, ${input.endpoint}, ${input.p256dh}, ${input.auth},
      ${input.userAgent ?? null}, ${SITE}, ${input.clerkUserId ?? null}, NOW()
    )
    ON CONFLICT (endpoint) DO UPDATE SET
      p256dh        = EXCLUDED.p256dh,
      auth          = EXCLUDED.auth,
      user_agent    = EXCLUDED.user_agent,
      clerk_user_id = COALESCE(EXCLUDED.clerk_user_id, push_subscriptions.clerk_user_id),
      last_used_at  = NOW()
  `;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const sql = getClient();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} AND site = ${SITE}`;
}

export type StoredPushSub = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function listPushSubscriptions(): Promise<StoredPushSub[]> {
  const sql = getClient();
  const rows = await sql`
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE site = ${SITE}
  `;
  return rows as unknown as StoredPushSub[];
}

export async function pruneEndpoints(endpoints: string[]): Promise<void> {
  if (endpoints.length === 0) return;
  const sql = getClient();
  for (const ep of endpoints) {
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${ep}`;
  }
}
