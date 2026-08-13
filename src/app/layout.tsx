import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/site/MotionProvider";
import { t } from "@/lib/copy";

/**
 * Manrope carries Cyrillic, is web-licensed, and its tight geometric numerals
 * suit a price ticker — which is most of this site's typography.
 *
 * To switch to genuine Helvetica Neue (not web-licensed, absent on Windows and
 * Android, so it can only ever lead a stack): drop the woff2 files in
 * /public/fonts, declare @font-face, and put that family first in --font-sans
 * in globals.css. Manrope stays as the fallback and nothing else changes.
 */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/*
 * Built from copy.ts rather than written out, so renaming the house updates the
 * browser tab and the share cards too. These were hardcoded and kept saying
 * "ХУДАЛДАА" after the rename — metadata is user-facing copy like any other.
 */
const SITE_TITLE = `${t.brand.name} — ${t.brand.tagline}`;

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s · ${t.brand.name}`,
  },
  description:
    "Зургаан тойрогтой, 2 цаг 45 минут үргэлжлэх дуудлага худалдаа. Тойрог давах тусам үнэ хаях хугацаа 5 минутаас 5 секунд болж хумирна.",
  openGraph: {
    title: SITE_TITLE,
    description:
      "Зургаан тойрог, 2 цаг 45 минут. Хугацаа хумигдана, шийдэмгий нь цохино.",
    type: "website",
    locale: "mn_MN",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#17120e" },
  ],
  /* The bid panel sits against the bottom edge — it needs the safe area. */
  viewportFit: "cover",
};

/*
 * Runs synchronously while the browser parses <head>, so both effects land
 * before the first paint:
 *
 *   1. `data-theme` — the server prerenders the light default (a cookie read
 *      here would opt the whole app out of static prerendering). Applying the
 *      saved choice before paint is what prevents the white flash.
 *   2. `.js` — gates the scroll-reveal hidden state. Reveals only hide
 *      themselves once this class proves scripting is alive, so a script
 *      failure degrades to plain visible content instead of a blank page.
 *
 * "system" is stored as the absence of data-theme, letting the
 * prefers-color-scheme block in globals.css decide.
 */
const BEFORE_PAINT = `(function(){try{var d=document.documentElement;d.classList.add("js");var t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
