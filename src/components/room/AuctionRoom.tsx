"use client";

import { useTransition } from "react";
import { Header } from "@/components/site/Header";
import { LiveDot } from "@/components/lot/LotCard";
import { LotPlate } from "@/components/lot/LotPlate";
import { placeBid as submitBid } from "@/lib/api";
import { LATE_JOIN_PENALTY_PTS } from "@/lib/auction";
import { bidClockLabel, pts, ptsToMnt } from "@/lib/format";
import { t } from "@/lib/copy";
import type { Lot } from "@/lib/types";
import { BidClock } from "./BidClock";
import { BidFeed } from "./BidFeed";
import { BidPanel } from "./BidPanel";
import { RoundRail } from "./RoundRail";
import { ROUND_TIME_SCALE, useAuctionRoom } from "./useAuctionRoom";

export function AuctionRoom({ lot }: { lot: Lot }) {
  const {
    state,
    spec,
    isYourLead,
    yourPaddle,
    placeBid,
    revertBid,
    advanceRound,
    hammer,
  } = useAuctionRoom(lot);

  const [pending, startTransition] = useTransition();

  /*
   * Optimistic bidding. The reducer applies the bid on the click frame so the
   * price and clock move immediately; the network call follows and only rolls
   * back on rejection.
   *
   * When the back-end lands, `submitBid` becomes a Server Function and this
   * becomes the useOptimistic + useTransition pair from the Next.js
   * "Building interactive apps" guide — the call shape here is already right.
   */
  function attemptBid(points: number) {
    const prevPts = state.currentPts;
    const prevLeader = state.leader;
    const bidId = placeBid(points, yourPaddle, true);

    startTransition(async () => {
      const res = await submitBid(lot.id, points);
      if (!res.ok) revertBid(bidId, prevPts, prevLeader);
    });
  }

  const frozen = state.outcome !== "running";
  const bidClockTotalMs = spec.bidClockSec * 1000;
  const roundTotalMs = (spec.durationMin * 60_000) / ROUND_TIME_SCALE;

  return (
    <div data-skin="room" className="grain min-h-dvh bg-ground text-ink">
      <Header minimal />

      {/*
        The room settles in rather than cutting — it is a drop into a dark
        space, so the entrance is slower than the site's usual rise.

        ⚠ `room-in` is an opacity-only fade, and must stay that way. BidPanel is
        a descendant and is `position: fixed` on phones; any transform, filter or
        backdrop-filter on this element would make it the containing block and
        un-pin the panel from the viewport. Same reason nothing here gets a
        `will-change: transform`.
      */}
      <main className="gutter animate-room-in pt-4 sm:pt-6 pb-64 lg:pt-10 lg:pb-20">
        {/* ── Lot identity ─────────────────────────────────────────────────
         * On phones the object leads: a full-width plate, the name under it,
         * then the catalogue facts, then the note — a catalogue page that
         * happens to be live. Above lg the sidebar carries the plate and the
         * facts instead, so both are hidden here.
         *
         * The identity text itself is rendered once and shared by both layouts.
         * Duplicating it per breakpoint would put two <h1>s in the document,
         * which is a real problem for screen readers even when one is
         * display:none to sighted users.
         */}
        <div className="flex flex-col gap-5">
          <LotPlate
            category={lot.category}
            image={lot.image}
            alt={lot.title}
            priority
            ratio="aspect-square"
            className="w-full lg:hidden"
          />

          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-2">
              {!frozen && <LiveDot />}
              <span className={frozen ? "" : "text-rust"}>
                {frozen ? t.room.sold : t.room.live}
              </span>
              <span aria-hidden className="text-line-strong">
                /
              </span>
              {lot.code}
            </p>
            <h1 className="mt-1.5 text-2xl leading-tight font-medium tracking-[-0.03em] md:text-3xl">
              {lot.title}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {lot.maker} · {lot.year}
            </p>
          </div>
        </div>

        {/*
          Joining a sale already under way is chargeable, so it is disclosed on
          arrival rather than at the moment of bidding — a charge a bidder only
          learns about after committing is a dark pattern, however small.

          Shown while the lot is live and this bidder has not bid yet; it
          disappears on their first bid, by which point they have accepted it.
        */}
        {!frozen && !state.hasBid && (
          <div className="mt-6 flex items-start gap-3 border border-flare/30 bg-flare/5 px-4 py-3.5">
            <span
              aria-hidden
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-flare/50 text-[0.625rem] font-bold text-flare"
            >
              !
            </span>
            <div className="min-w-0">
              <p className="eyebrow text-flare">{t.room.joinPenaltyLabel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {t.room.joinPenalty(LATE_JOIN_PENALTY_PTS)}
              </p>
            </div>
          </div>
        )}

        {/* Catalogue detail under the object, phones only — the sidebar carries
            these above lg. The prose note is deliberately not here: it belongs
            to the catalogue page (LotPreview), and in the room it pushed the
            clock and the price further below the fold to no benefit. */}
        <LotFacts
          lot={lot}
          className="mt-7 border-t border-line pt-5 lg:hidden"
        />

        <div className="mt-8 grid items-start gap-6 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-10">
          {/* ── Left: clocks, price, rounds, feed ──────────────────────── */}
          <div className="flex flex-col gap-6">
            <BidClock
              endsAt={state.bidClockEndsAt}
              totalMs={bidClockTotalMs}
              frozen={frozen}
              onExpire={hammer}
            />

            {/* Current price */}
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-line pb-5">
              <div>
                <p className="eyebrow">{t.room.currentPrice}</p>
                <p
                  key={state.currentPts}
                  data-numerals
                  aria-live="polite"
                  className="display mt-2 animate-flare-in text-[clamp(2.75rem,11vw,4.5rem)] text-ink"
                >
                  {pts(state.currentPts)}
                  <span className="ml-2 align-baseline text-base font-normal tracking-normal text-muted">
                    {t.common.point}
                  </span>
                </p>
                <p data-numerals className="mt-1 text-sm text-muted">
                  {ptsToMnt(state.currentPts)}
                </p>
              </div>

              <div className="text-right">
                <p className="eyebrow">{t.room.leader}</p>
                <p
                  data-numerals
                  className={`mt-2 text-2xl font-medium ${
                    isYourLead ? "text-flare" : "text-ink"
                  }`}
                >
                  {state.leader
                    ? isYourLead
                      ? t.room.you
                      : state.leader
                    : "—"}
                </p>
                {state.hasBid && !isYourLead && !frozen && (
                  <p className="mt-1 text-xs font-medium text-rust">
                    {t.room.outbid}
                  </p>
                )}
              </div>
            </div>

            {/* Round change acknowledgement */}
            {state.round > 1 && (
              <p
                key={state.round}
                className="eyebrow animate-flare-in text-flare"
              >
                {t.room.roundAdvanced(state.round)} ·{" "}
                {t.room.roundClockShrunk(bidClockLabel(spec.bidClockSec))}
              </p>
            )}

            <RoundRail
              round={state.round}
              roundEndsAt={state.roundEndsAt}
              roundTotalMs={roundTotalMs}
              frozen={frozen}
              onExpire={advanceRound}
            />

            <BidFeed bids={state.bids} />
          </div>

          {/* ── Right: object, bid panel, catalogue facts ───────────────── */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
            <LotPlate
              category={lot.category}
              code={lot.code}
              image={lot.image}
              alt={lot.title}
              className="hidden lg:block"
            />

            <BidPanel
              state={state}
              isYourLead={isYourLead}
              pending={pending}
              onBid={attemptBid}
            />

            {/* Same component as the phone layout, just placed in the sidebar
                instead of the main flow. */}
            <LotFacts
              lot={lot}
              className="hidden border-t border-line pt-5 lg:grid"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

/**
 * The five catalogue facts. Rendered twice — once in the phone flow under the
 * object, once in the desktop sidebar — but defined once, so the two layouts
 * cannot drift apart. Two columns on phones (the values are short enough to
 * pair up), one in the narrow sidebar.
 */
function LotFacts({ lot, className = "" }: { lot: Lot; className?: string }) {
  return (
    <dl
      className={`grid grid-cols-2 gap-x-5 gap-y-5 lg:grid-cols-1 lg:gap-y-4 ${className}`}
    >
      <Fact label={t.lot.estimate}>
        <span data-numerals>
          {pts(lot.estimateLowPts)} – {pts(lot.estimateHighPts)}{" "}
          {t.common.point}
        </span>
      </Fact>
      <Fact label={t.lot.opening}>
        <span data-numerals>{ptsToMnt(lot.openingPts)}</span>
      </Fact>
      <Fact label={t.lot.dimensions}>{lot.dimensions}</Fact>
      <Fact label={t.lot.condition}>{lot.condition}</Fact>
      <Fact label={t.lot.provenance} span>
        {lot.provenance}
      </Fact>
    </dl>
  );
}

function Fact({
  label,
  children,
  span = false,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${span ? "col-span-2 lg:col-span-1" : ""} ${className}`.trim()}
    >
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}
