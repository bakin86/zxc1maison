"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  ROUNDS,
  TOTAL_ROUNDS,
  minIncrementPts,
  roundSpec,
} from "@/lib/auction";
import { RIVAL_PADDLES, YOUR_PADDLE, seedBids } from "@/lib/mock";
import type { Bid, Lot, RoomState } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DEMO TIME COMPRESSION
 *
 * A real session is 2h45m, which nobody will sit through in a review. Round
 * durations are divided by this factor while BID CLOCKS stay at their true
 * lengths (5min … 5sec).
 *
 * At 60 the mapping is one second per real minute, so the whole six-round arc
 * plays out in 2 minutes 45 seconds — the same figure as the real thing — and
 * the bid clock only becomes the binding constraint in rounds 5 and 6, exactly
 * where it does in a real sale.
 *
 * Set to 1 for production.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ROUND_TIME_SCALE = 60;

/** Rival bidders. The websocket feed replaces this wholesale — see api.ts. */
const SIMULATE_RIVALS = true;

function roundMs(n: number) {
  return (roundSpec(n).durationMin * 60_000) / ROUND_TIME_SCALE;
}

function bidClockMs(n: number) {
  return roundSpec(n).bidClockSec * 1000;
}

type Action =
  | { type: "bid"; paddle: string; points: number; isYou: boolean; at: number }
  | { type: "revert"; bidId: string; toPts: number; toLeader: string | null }
  | { type: "advance"; at: number }
  | { type: "hammer" };

function init(lot: Lot, now: number): RoomState {
  const bids = seedBids(lot);
  return {
    lot,
    round: 1,
    currentPts: bids[0]?.points ?? lot.openingPts,
    leader: bids[0]?.paddle ?? null,
    bidClockEndsAt: now + bidClockMs(1),
    roundEndsAt: now + roundMs(1),
    bids,
    hasBid: false,
    outcome: "running",
  };
}

function reducer(state: RoomState, action: Action): RoomState {
  switch (action.type) {
    case "bid": {
      if (state.outcome !== "running") return state;
      if (action.points <= state.currentPts) return state;

      const bid: Bid = {
        id: `${action.at}-${action.paddle}`,
        paddle: action.paddle,
        points: action.points,
        round: state.round,
        at: action.at,
        isYou: action.isYou,
      };

      return {
        ...state,
        currentPts: action.points,
        leader: action.paddle,
        // Every accepted bid resets the bid clock to the round's full length.
        bidClockEndsAt: action.at + bidClockMs(state.round),
        bids: [bid, ...state.bids].slice(0, 40),
        hasBid: state.hasBid || action.isYou,
      };
    }

    /* Only reachable if the stubbed placeBid rejects — see BidPanel. */
    case "revert":
      return {
        ...state,
        bids: state.bids.filter((b) => b.id !== action.bidId),
        currentPts: action.toPts,
        leader: action.toLeader,
      };

    case "advance": {
      if (state.outcome !== "running") return state;

      // Round 6 running out ends the sale.
      if (state.round >= TOTAL_ROUNDS) {
        return { ...state, outcome: state.leader ? "sold" : "unsold" };
      }

      const next = state.round + 1;
      return {
        ...state,
        round: next,
        roundEndsAt: action.at + roundMs(next),
        // The new, shorter clock starts immediately so bidders see it at once.
        bidClockEndsAt: action.at + bidClockMs(next),
      };
    }

    case "hammer":
      if (state.outcome !== "running") return state;
      return { ...state, outcome: state.leader ? "sold" : "unsold" };
  }
}

export function useAuctionRoom(lot: Lot) {
  /*
   * Lazy init runs on both server and client, so Date.now() differs between
   * them — but every value derived from it is only ever rendered through
   * useCountdown, which returns null until the first client frame. No clock
   * text reaches the server HTML.
   */
  const [state, dispatch] = useReducer(reducer, lot, (l) => init(l, Date.now()));

  /** Returns the id the reducer will assign, so a failed bid can be reverted. */
  const placeBid = useCallback(
    (points: number, paddle: string, isYou: boolean) => {
      const at = Date.now();
      dispatch({ type: "bid", paddle, points, isYou, at });
      return `${at}-${paddle}`;
    },
    [],
  );

  const revertBid = useCallback(
    (bidId: string, toPts: number, toLeader: string | null) => {
      dispatch({ type: "revert", bidId, toPts, toLeader });
    },
    [],
  );

  const advanceRound = useCallback(() => {
    dispatch({ type: "advance", at: Date.now() });
  }, []);

  const hammer = useCallback(() => {
    dispatch({ type: "hammer" });
  }, []);

  /* ── Rival bidders ──────────────────────────────────────────────────────
   * A self-rescheduling timeout reading live state through a ref, so the
   * effect mounts once instead of resetting on every price change.
   */
  const live = useRef(state);
  useEffect(() => {
    live.current = state;
  }, [state]);

  useEffect(() => {
    if (!SIMULATE_RIVALS) return;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const { round } = live.current;
      const clockSec = roundSpec(round).bidClockSec;
      // A rival answers somewhere inside the clock, but never so slowly that
      // round 1's five-minute clock leaves the demo silent for four minutes.
      const delay = Math.min(
        Math.max(clockSec * (0.3 + Math.random() * 0.5) * 1000, 2200),
        11_000,
      );

      timer = setTimeout(() => {
        const s = live.current;
        if (s.outcome === "running") {
          const step = minIncrementPts(s.round, true);
          // Most rivals nudge; occasionally one leans on it.
          const multiplier = Math.random() < 0.18 ? 3 : Math.random() < 0.5 ? 2 : 1;
          const paddle =
            RIVAL_PADDLES[Math.floor(Math.random() * RIVAL_PADDLES.length)];
          placeBid(s.currentPts + step * multiplier, paddle, false);
        }
        if (live.current.outcome === "running") schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [placeBid]);

  const derived = useMemo(() => {
    const spec = roundSpec(state.round);
    return {
      spec,
      /* Fraction of the whole 2h45m programme elapsed, for the rail. */
      roundsTotal: ROUNDS.length,
      yourPaddle: YOUR_PADDLE,
      isYourLead: state.leader === YOUR_PADDLE,
    };
  }, [state.round, state.leader]);

  return {
    state,
    ...derived,
    placeBid,
    revertBid,
    advanceRound,
    hammer,
  };
}
