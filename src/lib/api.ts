import { LOTS } from "./mock";
import type { Lot } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE BACK-END SEAM
 *
 * This is the only module that touches mock data. Everything else in the app
 * calls these functions. To go live, replace each body with a real call and
 * delete `src/lib/mock.ts` — no component changes required.
 *
 * Expected shape of the real implementation:
 *
 *   getLots / getLot     → REST or GraphQL read, called from Server Components.
 *   placeBid             → a Server Function ('use server') that validates the
 *                          bid against src/lib/auction.ts server-side and
 *                          calls refresh(); the client already renders it
 *                          optimistically, so latency is invisible.
 *   subscribeToRoom      → websocket / SSE feed pushing RoomState deltas.
 *                          The room currently drives itself from a local
 *                          simulator; swapping this in replaces that.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export async function getLots(): Promise<Lot[]> {
  return LOTS;
}

export async function getLot(id: string): Promise<Lot | null> {
  return LOTS.find((l) => l.id === id) ?? null;
}

/** The lot the hero and the header CTA point at — the longest-running one. */
export async function getLiveLot(): Promise<Lot> {
  return LOTS.find((l) => l.status === "live") ?? LOTS[0];
}

/** Every lot currently under way. Several run concurrently. */
export async function getLiveLots(): Promise<Lot[]> {
  return LOTS.filter((l) => l.status === "live");
}

/** Lots whose session has not opened yet, soonest first. */
export async function getUpcomingLots(): Promise<Lot[]> {
  return LOTS.filter((l) => l.status === "upcoming").sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
}

/** Lots already through the room — sold or unsold. */
export async function getResultLots(): Promise<Lot[]> {
  return LOTS.filter((l) => l.status === "sold" || l.status === "unsold");
}

export type BidResult =
  | { ok: true; acceptedPts: number }
  | { ok: false; reason: "too-low" | "round-closed" | "not-registered" };

/**
 * Stub. Resolves after a short delay so the optimistic UI in BidPanel is
 * exercised against realistic latency during development.
 */
export async function placeBid(
  _lotId: string,
  points: number,
): Promise<BidResult> {
  await new Promise((r) => setTimeout(r, 260));
  return { ok: true, acceptedPts: points };
}
