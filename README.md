# ХУДАЛДАА — дуудлага худалдааны танхим

Front-end only. Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4,
TypeScript. Mongolian UI. No back-end — every read and write goes through one
stub module that is designed to be replaced.

```bash
npm run dev
```

---

## The format

Six rounds, 2h45m total. Two clocks run at once, and that is the whole game:

| Round | Bid clock | Round length | Min raise | Late entry |
| ----- | --------- | ------------ | --------- | ---------- |
| 1     | 5 min     | 25 min       | 1 pt      | —          |
| 2     | 3 min     | 25 min       | 2 pt      | 20 pt      |
| 3     | 1 min     | 25 min       | 2 pt      | 30 pt      |
| 4     | 30 sec    | 25 min       | 2 pt      | 40 pt      |
| 5     | 15 sec    | 25 min       | 2 pt      | 50 pt      |
| 6     | 5 sec     | 40 min       | 2 pt      | 60 pt      |

- **Bid clock** resets to the round's length on every accepted bid. If it hits
  zero, the lot is hammered.
- **Round clock** is fixed wall-clock time. When it expires the auction advances
  a round and the bid clock gets shorter. Round 6 expiring ends the sale.
- **1 point = 1 000₮.** All prices are held in points; ₮ is display only.
- **Late entry:** a bidder who has not yet bid on this lot must enter at
  `round × 10` points above the standing price, from round 2 onward.

All of this lives in [`src/lib/auction.ts`](src/lib/auction.ts) as data, not as
scattered conditionals. **It is the contract — the server must agree with these
numbers, and nothing else in the front-end hard-codes them.**

---

## The back-end seam

[`src/lib/api.ts`](src/lib/api.ts) is the only module that touches mock data.
Replace each body with a real call and delete `src/lib/mock.ts`; no component
changes required.

| Function           | Should become                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `getLots`/`getLot` | A read from your API, called from Server Components.                                                       |
| `placeBid`         | A Server Function (`'use server'`) that re-validates against `auction.ts` **server-side**, then `refresh()`. |
| room updates       | A websocket/SSE feed pushing `RoomState` (see [`src/lib/types.ts`](src/lib/types.ts)).                      |

The client already renders bids optimistically, so network latency is invisible
and a rejected bid rolls back on its own. `RoomState` is shaped to be a
websocket payload as-is.

⚠ **Bid validation is currently client-side only.** `isLegalBid` in the panel is
a UX affordance, not a control. The server must enforce every rule
independently.

### Two knobs to flip for production

```ts
// src/components/room/useAuctionRoom.ts
export const ROUND_TIME_SCALE = 60;  // → 1   (60 compresses 2h45m into 2m45s for demos)
const SIMULATE_RIVALS = true;        // → false (fake rival bidders; the websocket replaces them)
```

`ROUND_TIME_SCALE = 60` maps one real minute to one second, so the whole
six-round arc plays in 2 min 45 sec and the bid clock only becomes the binding
constraint in rounds 5–6 — exactly as it does in a real sale. Bid clocks are
never scaled.

---

## Design system

Autumn/brown, premium and minimal. Two skins share **one** set of token names in
[`src/app/globals.css`](src/app/globals.css):

| Role       | Light shell (browsing) | Dark roast (live room) |
| ---------- | ---------------------- | ---------------------- |
| ground     | `#faf7f2` bone         | `#17120e` roast        |
| surface    | `#f3ede4`              | `#241a13`              |
| ink        | `#1c1714` umber        | `#f4ece2`              |
| accent     | `#7a4b2a` chestnut     | `#c98a4b` amber gold   |
| flare      | `#c6743e` burnt amber  | `#d99a55`              |
| rust       | `#a3341f` urgency      | `#cf5f34`              |
| olive      | `#5c6b4b` confirmed    | `#7d8a5f`              |

Tokens come in two layers: a **raw palette** of plain custom properties (the
only literal colours in the codebase, deliberately outside `@theme` so Tailwind
does not emit a utility per swatch), and **semantic tokens** inside `@theme`
that point at them. Re-skinning is re-pointing semantics at different raws.

Because plain `@theme` (not `@theme inline`) emits utilities as
`var(--color-x)`, all four states below work through ordinary cascade — a
component written with `bg-surface text-ink` is correct in every one and never
needs a `dark:` variant. **Add a state by copying a block, not by touching
components.**

| State                          | Resolves to                                    |
| ------------------------------ | ---------------------------------------------- |
| `:root`                        | light — the default, and what the server renders |
| `@media (prefers-color-scheme: dark)` + `:root:not([data-theme="light"])` | dark, following the OS |
| `:root[data-theme="dark"]`     | dark, explicitly chosen                        |
| `[data-skin="room"]`           | **always dark** — see below                    |

The live bidding room is a *place*, not a theme, so it stays dark even for a
light-mode visitor. Custom properties inherit, so `[data-skin="room"]` on the
wrapper beats `:root` for everything inside it regardless of specificity. The
room's header therefore drops the theme control — offering a light switch there
would promise something it will not do.

⚠ The two dark blocks in `globals.css` are duplicates by necessity (a media
query and a selector cannot be merged). **Keep them in sync.**

### Theme switching

Three states, with **system as the default**, stored in `localStorage`.
"system" is the *absence* of `data-theme`, which hands the decision back to
`prefers-color-scheme` — including when the OS flips at sunset.

The inline script in `layout.tsx` applies the saved choice **before first
paint**; that is what prevents a white flash on load. A cookie would let the
server read it, but reading cookies in the root layout opts the whole app out of
static prerendering, so the script is the right trade here.

`ThemeToggle` treats the theme as **external state, not React state** — the
truth lives in the `data-theme` attribute, and `useSyncExternalStore` reads it.
Mirroring it into `useState` would need an effect (a cascading render, which the
`react-hooks/set-state-in-effect` rule exists to catch) and give React a second
source of truth. Subscribing to `storage` also means changing the theme in one
tab updates every other open tab for free.

**Type:** Manrope (`next/font/google`, latin + cyrillic). It carries Cyrillic,
is web-licensed, and its tight geometric numerals suit a price ticker. To switch
to genuine Helvetica Neue — not web-licensed, and absent on Windows and Android,
so it can only ever *lead* a stack — drop the woff2 files in `public/fonts`,
declare `@font-face`, and put that family first in `--font-sans`. Manrope stays
as the metrical fallback and nothing else changes.

---

## Motion

Four kinds, and one rule: **no animation may ever be the reason content is
invisible.**

**Scroll reveals** (`Reveal` + `reveal-manager.ts`). The hidden state lives
behind a `.js` class the head script adds before first paint — no script, no
hidden rule, content renders plainly.

The manager deliberately does **not** use `IntersectionObserver`, which is the
obvious choice and the wrong one. IO only notifies when an intersection ratio
*crosses a threshold*; jump straight past an element — anchor link, End key,
`scrollTo`, a browser-restored scroll position — and it goes from ratio 0 (below
the viewport) to ratio 0 (above it) without crossing anything. No callback, and
that section sits at opacity 0 forever. So the test is positional instead:
"has this element's top come past the trigger line", which is true both for
elements scrolling in and for elements already scrolled beyond.

One passive listener and one rAF-throttled pass serve every Reveal on the page,
and the whole thing detaches once everything is revealed. A `setTimeout`
backstop covers documents that produce no frames at all (a tab loaded in the
background, where rAF can stay parked indefinitely) — content ends up visible,
just un-animated, which nobody can see anyway.

**Entrances.** Above-the-fold content uses `rise-in` keyframes with staggered
`animationDelay` rather than reveals — there is no intersection to wait for. The
room gets a slower `room-in` fade, matching the drop into a dark space.

⚠ **`room-in` is opacity-only and must stay that way.** It animates `<main>`,
which contains the bid panel, and the panel is `position: fixed` on phones. A
transformed (or filtered) ancestor becomes the containing block for fixed
descendants, so adding a `scale` here un-pins the panel from the viewport for the
whole animation and bottoms it out against `<main>` instead — hundreds of pixels
below the fold, so phone users watch the bid button fly up into place on every
load. This was shipped and fixed; the constraint is commented at both the
keyframes and the usage site. Anything that needs a transform must go on an
element that is not an ancestor of the panel.

**Shared-element morph.** A lot's plate carries the same
`<ViewTransition name={...}>` in the catalogue grid and on the lot page, so the
browser animates one object moving between routes instead of two swapping. Per
the React docs, `default="none"` stops it crossfading on unrelated transitions —
and the explicit `share="morph"` must stay, or the pair silently stops morphing.
Applied only between the light-shell pages; the room is a deliberate hard cut,
and the room renders two responsive plates, which would collide on name.

**Theme crossfade.** `document.startViewTransition` fades the whole page in one
composited step. A colour transition on every element would instead repaint the
entire tree on every hover, for the sake of one interaction.

⚠ `startViewTransition` runs its callback on a *later frame*, and a hidden
document may not produce one for seconds — which would strand the theme change,
since the attribute write lives in that callback. Hence the
`visibilityState === "visible"` guard. Measured at several seconds' delay on a
backgrounded tab before the guard went in.

Everything is disabled under `prefers-reduced-motion`, view transitions
included — those need stopping explicitly.

---

## Layout

```
src/
  app/
    layout.tsx              Manrope, metadata, safe area, pre-paint theme script
    globals.css             raw palette → semantic tokens, 4 theme states,
                            keyframes, reveal rules, view-transition CSS
    page.tsx                home: hero, live lot, round ladder, catalogue, results
    rules/page.tsx          the format in prose + table
    auction/[id]/page.tsx   one URL per lot, three states (see below)
    not-found.tsx
  components/
    site/        Header, Footer, RoundLadder, ThemeToggle,
                 Reveal + reveal-manager
    lot/         LotCard, LotPlate, LotPreview
    room/        AuctionRoom, BidClock, BidPanel, BidFeed, RoundRail,
                 useAuctionRoom (state machine), useCountdown
  lib/
    auction.ts   ← the rules. Single source of truth.
    api.ts       ← the back-end seam.
    types.ts  copy.ts  format.ts  mock.ts
```

`/auction/[id]` is **one route, three branches**: live lots get the dark bidding
room, upcoming lots get the catalogue preview, and finished lots get their
result. A bidder can bookmark one URL per lot and it becomes the bidding screen
when the session opens, then the result page afterwards.

The demo catalogue is 12 lots across all six categories, covering every status
the UI renders: 1 live, 8 upcoming, 2 sold, 1 unsold.

### Notes worth knowing before you edit

- **All copy is in [`src/lib/copy.ts`](src/lib/copy.ts).** Components never
  inline strings, so adding English means adding a second dictionary of the same
  shape plus a locale switch — no component edits.
- **Formatting is hand-rolled, not `Intl`** ([`format.ts`](src/lib/format.ts)).
  `Intl`'s grouping separator for `mn-MN` differs between Node and browser ICU
  builds, which surfaces as a hydration mismatch on every price on the page.
- **Seed data is deterministic — never `Date.now()`.** The room is a Client
  Component and so gets server-rendered too. Live deadlines are safe only
  because `useCountdown` returns `null` until the first client frame, so no
  clock text ever reaches the server HTML.
- **`useCountdown` throttles by display precision.** The bid clock asks for 50ms
  (it shows tenths under ten seconds); the round clock asks for 1000ms and so
  re-renders once a second instead of sixty times. Clocks own their own ticking
  so the bid feed does not re-render at 60fps.
- **rAF pauses in a hidden tab.** Remaining time is computed from an absolute
  deadline, so a backgrounded tab self-heals the instant it is refocused. In
  production the server is authoritative for expiry regardless.
- **`LotPlate` is placeholder artwork**, not a grey box: a warm ground plus a
  single-stroke silhouette per category, drawn in CSS/SVG with no network
  assets. Swap the inner content for `<Image>` when real photos arrive; the
  aspect box and overlays around it stay.

---

## Still to do

- Auth: `Нэвтрэх` / `Бүртгүүлэх` are inert buttons.
- Server-side bid validation and the websocket feed (above).
- Real lot photography.
- Payment / settlement after the hammer.
