import Link from "next/link";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { EnterRoomButton } from "@/components/site/EnterRoomButton";
import { LiveTicker } from "@/components/site/LiveTicker";
import { Reveal } from "@/components/site/Reveal";
import { RoundLadder } from "@/components/site/RoundLadder";
import { LotCard } from "@/components/lot/LotCard";
import { LotPlate } from "@/components/lot/LotPlate";
import {
  getLiveLot,
  getLiveLots,
  getResultLots,
  getUpcomingLots,
} from "@/lib/api";
import { POINT_MNT, ROUNDS, TOTAL_ROUNDS } from "@/lib/auction";
import { bidClockLabel, groupNumber, pts, ptsToMnt } from "@/lib/format";
import { t } from "@/lib/copy";

const BEAT = 90;

export default async function HomePage() {
  const [live, liveLots, upcoming, results] = await Promise.all([
    getLiveLot(),
    getLiveLots(),
    getUpcomingLots(),
    getResultLots(),
  ]);
  const lastRound = ROUNDS[ROUNDS.length - 1];
  /* Several lots run concurrently; one is featured, the rest get a row. */
  const otherLive = liveLots.filter((l) => l.id !== live.id);

  return (
    <>
      <Header />

      <main className="pt-28 md:pt-36 text-left">
        {/* ── Left-Aligned Minimalist Hero ───────────────────────────────── */}
        {/*
          `overflow-x-clip` is load-bearing, not tidiness. The glow below is
          wider than a phone screen, and an unclipped decorative element widens
          the *document* — which then makes the fixed header, sized in %, resolve
          against 534px instead of the 390px viewport and hang off the edge.
          `clip` rather than `hidden` so the glow can still bleed vertically.
        */}
        <section className="gutter relative isolate overflow-x-clip pb-16 md:pb-24 border-b border-line/40">
          {/* Ambient glow behind the headline. Decorative, non-interactive, and
              transformed — which is safe here because nothing inside the hero is
              position: fixed. */}
          <div
            aria-hidden
            className="animate-aura pointer-events-none absolute -top-32 -left-24 -z-10 size-[24rem] rounded-full blur-3xl md:size-[36rem]"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 22%, transparent) 0%, transparent 68%)",
            }}
          />

          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-12">
              <p className="eyebrow animate-rise-in text-muted">{t.home.eyebrow}</p>

              <h1
                className="display mt-6 animate-rise-in text-[clamp(2.5rem,7vw,5.5rem)] font-light text-ink leading-[0.96] tracking-[-0.035em] max-w-4xl"
                style={{ animationDelay: `${BEAT}ms` }}
              >
                {t.home.headline[0]}
                <br />
                <span className="font-normal text-accent">{t.home.headline[1]}</span>
              </h1>
            </div>

            <div className="md:col-span-8 mt-2">
              <p
                className="text-base md:text-lg leading-relaxed text-ink-soft animate-rise-in font-normal max-w-xl"
                style={{ animationDelay: `${BEAT * 2}ms` }}
              >
                {t.home.lede}
              </p>

              <div
                className="mt-8 flex flex-wrap items-center gap-3 animate-rise-in"
                style={{ animationDelay: `${BEAT * 3}ms` }}
              >
                {/* Opens the catalogue, not a room. The badge still reports how
                    many sales are running, so the pull is intact — but the
                    visitor picks the lot instead of being dropped into one. */}
                <EnterRoomButton
                  href="/lots"
                  label={t.home.ctaBrowse}
                  liveCount={liveLots.length}
                  countLabel={t.home.liveCount(liveLots.length)}
                />
                <Link
                  href="/rules"
                  className="flex h-11 items-center justify-center rounded-full border border-line-strong/30 px-5 text-[0.75rem] font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:border-accent hover:text-accent"
                >
                  {t.home.ctaSecondary}
                </Link>
              </div>

              {/* An auction in motion, not a poster about one. */}
              <div
                className="mt-7 animate-rise-in border-t border-line/40 pt-5"
                style={{ animationDelay: `${BEAT * 4}ms` }}
              >
                <LiveTicker
                  lots={liveLots.map((l) => ({
                    id: l.id,
                    code: l.code,
                    title: l.title,
                    startPts: l.openingPts,
                  }))}
                />
              </div>
            </div>
          </div>

          <dl
            className="mt-16 grid animate-rise-in grid-cols-2 gap-x-8 gap-y-6 border-t border-line/40 pt-8 md:grid-cols-4"
            style={{ animationDelay: `${BEAT * 4}ms` }}
          >
            <Stat value={String(TOTAL_ROUNDS)} label={t.home.statRounds} />
            <Stat value="2:45" label={t.home.statDuration} />
            <Stat
              value={groupNumber(POINT_MNT)}
              suffix="₮"
              label={t.home.statPoint}
            />
            <Stat
              value={bidClockLabel(lastRound.bidClockSec)}
              label={t.home.statFinal}
              accent
            />
          </dl>
        </section>

        {/* ── Featured Lot Exhibition ─────────────────────────────────────── */}
        <Reveal as="section" className="gutter py-16 md:py-24 border-b border-line/40" y={20}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-rust" />
              <p className="eyebrow text-rust">{t.home.liveNowPlural}</p>
            </div>
            {liveLots.length > 1 && (
              <p className="eyebrow" data-numerals>
                {t.home.liveCount(liveLots.length)}
              </p>
            )}
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <Link href={`/auction/${live.id}`} className="group block lg:col-span-7">
              <LotPlate
                category={live.category}
                image={live.image}
                alt={live.title}
                code={live.code}
                ratio="aspect-[4/3]"
                className="border border-line/40 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
              />
            </Link>

            <div className="lg:col-span-5 text-left">
              <p className="eyebrow text-muted">{live.code}</p>
              <h2 className="display mt-2 text-[clamp(2rem,4vw,3.25rem)] font-normal text-ink leading-tight tracking-[-0.03em]">
                {live.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {live.maker} · {live.year}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                {live.note}
              </p>

              <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t border-line/40 pt-5">
                <div>
                  <dt className="eyebrow">{t.lot.estimate}</dt>
                  <dd data-numerals className="mt-1 font-medium text-ink">
                    {pts(live.estimateLowPts)} – {pts(live.estimateHighPts)}{" "}
                    <span className="text-xs text-muted">
                      {t.common.point}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">{t.lot.opening}</dt>
                  <dd data-numerals className="mt-1 font-medium text-ink">
                    {ptsToMnt(live.openingPts)}
                  </dd>
                </div>
              </dl>

              <div className="mt-7">
                <Link
                  href={`/auction/${live.id}`}
                  className="inline-flex h-11 items-center rounded-full border border-line-strong/40 px-6 text-[0.75rem] font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:border-accent hover:text-accent font-sans"
                >
                  {t.home.ctaEnter}
                  <span aria-hidden className="ml-1.5">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* The other concurrent lots. Same card as the catalogue, so a live
              lot looks like itself wherever it appears. */}
          {otherLive.length > 0 && (
            <div className="mt-14 border-t border-line/40 pt-10">
              <p className="eyebrow text-muted">{t.home.otherLive}</p>
              <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3">
                {otherLive.map((lot) => (
                  <LotCard key={lot.id} lot={lot} />
                ))}
              </div>
            </div>
          )}
        </Reveal>

        {/* ── Minimalist Rules Section ────────────────────────────────────── */}
        <Reveal as="section" className="gutter py-16 md:py-24 border-b border-line/40" y={20}>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5 text-left">
              <p className="eyebrow text-muted">{t.home.howItWorks}</p>
              <h2 className="display mt-3 text-[clamp(1.875rem,4vw,2.75rem)] font-light text-ink leading-tight tracking-[-0.03em]">
                5 минутаас
                <br />
                <span className="font-normal text-rust">5 секунд</span> хүртэл
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                {t.rules.lede}
              </p>
              <Link
                href="/rules"
                className="eyebrow mt-6 inline-block border-b border-accent/60 pb-0.5 text-accent transition-opacity hover:opacity-75"
              >
                {t.home.ctaSecondary} →
              </Link>
            </div>

            <div className="lg:col-span-7">
              <RoundLadder />
            </div>
          </div>
        </Reveal>

        {/* ── Catalogue Grid ─────────────────────────────────────────────── */}
        <section id="lots" className="gutter scroll-mt-24 py-16 md:py-24 border-b border-line/40">
          <Reveal className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line/40 pb-4">
            <div>
              <p className="eyebrow text-muted">{t.home.upcoming}</p>
              <h2 className="display mt-2 text-[clamp(1.875rem,4vw,2.75rem)] font-light text-ink tracking-[-0.03em]">
                {t.home.upcomingLede}
              </h2>
            </div>
            <p className="eyebrow text-faint">{t.home.pointNote}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            {upcoming.map((lot, i) => (
              <Reveal key={lot.id} delay={(i % 3) * 80} y={18}>
                <LotCard lot={lot} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Results Grid ────────────────────────────────────────────────── */}
        <section id="results" className="gutter scroll-mt-24 py-16 md:py-24">
          <Reveal className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line/40 pb-4">
            <div>
              <p className="eyebrow text-muted">{t.home.results}</p>
              <h2 className="display mt-2 text-[clamp(1.875rem,4vw,2.75rem)] font-light text-ink tracking-[-0.03em]">
                {t.home.resultsLede}
              </h2>
            </div>
            <p className="eyebrow text-faint">{t.home.resultsNote}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            {results.map((lot, i) => (
              <Reveal key={lot.id} delay={(i % 3) * 80} y={18}>
                <LotCard lot={lot} />
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Stat({
  value,
  label,
  suffix,
  accent = false,
}: {
  value: string;
  label: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="text-left">
      <dt className="eyebrow text-muted">{label}</dt>
      <dd
        data-numerals
        className={`display mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-light ${
          accent ? "text-rust font-normal" : "text-ink"
        }`}
      >
        {value}
        {suffix && (
          <span className="ml-1 align-baseline text-[0.4em] font-normal tracking-normal text-muted">
            {suffix}
          </span>
        )}
      </dd>
    </div>
  );
}


