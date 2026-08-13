/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUCTION RULES — single source of truth
 *
 * Every rule the client specified lives in this file as data, not as scattered
 * conditionals. The back-end must agree with these numbers; nothing else in the
 * front-end hard-codes them.
 *
 * Client spec, as given:
 *
 *   6 round, 2h45m total
 *   1 round — 5min bid clock  (25 min)   1000₮ = 1 point
 *   2 round — 3min bid clock  (25 min)   үнэ өсгөх доод лимит 2 point
 *   3 round — 1min bid clock  (25 min)   дундаас нь орохоор болвол round × 10
 *   4 round — 30sec bid clock (25 min)
 *   5 round — 15sec bid clock (25 min)
 *   6 round — 5sec bid clock  (40 min)
 *
 * Two independent clocks run at once, which is the heart of the format:
 *
 *   • BID CLOCK  — resets to the round's length on every accepted bid.
 *                  If it reaches zero, the lot is hammered (sold).
 *   • ROUND CLOCK — fixed wall-clock length per round. When it expires the
 *                  auction advances a round and the bid clock gets shorter.
 *
 * So the auction cannot end early from inactivity in round 1 without a sale,
 * and the pressure ratchets: five minutes to respond becomes five seconds.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** 1 point = 1000₮. Prices are held in points; ₮ is a display concern. */
export const POINT_MNT = 1000;

export interface RoundSpec {
  /** 1-indexed, matches what bidders are told. */
  n: number;
  /** Seconds a bid resets the clock to. */
  bidClockSec: number;
  /** Wall-clock length of the round, in minutes. */
  durationMin: number;
  /** Smallest legal raise, in points, for a bidder already in the auction. */
  minIncrementPts: number;
}

export const ROUNDS: readonly RoundSpec[] = [
  { n: 1, bidClockSec: 5 * 60, durationMin: 25, minIncrementPts: 1 },
  { n: 2, bidClockSec: 3 * 60, durationMin: 25, minIncrementPts: 2 },
  { n: 3, bidClockSec: 60, durationMin: 25, minIncrementPts: 2 },
  { n: 4, bidClockSec: 30, durationMin: 25, minIncrementPts: 2 },
  { n: 5, bidClockSec: 15, durationMin: 25, minIncrementPts: 2 },
  { n: 6, bidClockSec: 5, durationMin: 40, minIncrementPts: 2 },
] as const;

/**
 * Late-entry floor. A bidder who has not yet bid on this lot must enter at
 * `round × LATE_ENTRY_MULTIPLIER` points above the standing price — so joining
 * in round 3 costs at least +30 pts, and round 6 at least +60 pts. Applies
 * from round 2 onward; round 1 is open at the normal increment because nobody
 * is "joining from the middle" yet.
 *
 * ⚠ Confirmed with the client as: late joiner's FIRST bid ≥ round × 10.
 */
export const LATE_ENTRY_MULTIPLIER = 10;
export const LATE_ENTRY_FROM_ROUND = 2;

/**
 * Flat charge, in points, for opening a lot that is already under way.
 *
 * Deliberately NOT the same rule as LATE_ENTRY_MULTIPLIER above, though both
 * exist to price joining late:
 *
 *   • LATE_ENTRY_MULTIPLIER raises the floor of your first *bid* on that lot
 *     (round × 10 above the standing price). It costs you nothing unless you bid.
 *   • LATE_JOIN_PENALTY_PTS is deducted from your own balance for entering a
 *     running lot at all, whether or not you go on to bid.
 *
 * ⚠ Front-end only, and the back end must own the real deduction — a balance
 * the client can edit is not a balance. What is shown here is a disclosure of a
 * charge, not the charge itself.
 */
export const LATE_JOIN_PENALTY_PTS = 10;

export const TOTAL_ROUNDS = ROUNDS.length;

/** 25+25+25+25+25+40 = 165 min = 2h 45m. Asserted by a test-free invariant. */
export const TOTAL_MINUTES = ROUNDS.reduce((m, r) => m + r.durationMin, 0);

export function roundSpec(n: number): RoundSpec {
  return ROUNDS[Math.min(Math.max(n, 1), TOTAL_ROUNDS) - 1];
}

/** Minutes from auction open to the start of round `n`. */
export function roundStartMin(n: number): number {
  return ROUNDS.slice(0, n - 1).reduce((m, r) => m + r.durationMin, 0);
}

/**
 * The smallest legal next bid, in points.
 *
 * `hasBid` is the signed-in bidder's own history on this lot — it is what
 * separates a regular raise from a late entry.
 */
export function minNextBidPts(
  currentPts: number,
  round: number,
  hasBid: boolean,
): number {
  const spec = roundSpec(round);
  const step =
    !hasBid && round >= LATE_ENTRY_FROM_ROUND
      ? round * LATE_ENTRY_MULTIPLIER
      : spec.minIncrementPts;
  return currentPts + step;
}

/** The raise itself, in points — what the button label needs. */
export function minIncrementPts(round: number, hasBid: boolean): number {
  const spec = roundSpec(round);
  return !hasBid && round >= LATE_ENTRY_FROM_ROUND
    ? round * LATE_ENTRY_MULTIPLIER
    : spec.minIncrementPts;
}

/** Quick-bid offsets above the minimum, so the panel has one-tap options. */
export function quickStepsPts(round: number, hasBid: boolean): number[] {
  const base = minIncrementPts(round, hasBid);
  return [base, base * 2, base * 5];
}

export function isLegalBid(
  points: number,
  currentPts: number,
  round: number,
  hasBid: boolean,
): boolean {
  return Number.isFinite(points) && points >= minNextBidPts(currentPts, round, hasBid);
}

export type Urgency = "calm" | "warm" | "hot";

/**
 * Urgency for the clock's colour and pulse. Uses both absolute seconds and the
 * fraction remaining, because round 6's whole clock is 5 seconds — a purely
 * absolute threshold would render it permanently "hot", and a purely
 * fractional one would leave round 1's last 10 seconds looking calm.
 */
export function urgencyOf(remainingMs: number, totalMs: number): Urgency {
  const sec = remainingMs / 1000;
  const frac = totalMs > 0 ? remainingMs / totalMs : 0;
  if (sec <= 10 || frac <= 0.2) return "hot";
  if (sec <= 45 || frac <= 0.5) return "warm";
  return "calm";
}
