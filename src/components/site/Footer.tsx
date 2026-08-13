import Link from "next/link";
import { t } from "@/lib/copy";
import { POINT_MNT, TOTAL_ROUNDS } from "@/lib/auction";
import { groupNumber } from "@/lib/format";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="gutter flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <p className="text-[0.9375rem] font-bold tracking-[0.2em] text-ink">
            {t.brand.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t.brand.tagline} · {TOTAL_ROUNDS} тойрог · 1 {t.common.point} ={" "}
            {groupNumber(POINT_MNT)}₮
          </p>
          <p className="mt-4 text-xs leading-relaxed text-faint">
            {t.footer.demo}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/rules" className="eyebrow transition-colors hover:text-ink">
            {t.nav.rules}
          </Link>
          <Link href="/lots" className="eyebrow transition-colors hover:text-ink">
            {t.nav.lots}
          </Link>
          <Link
            href="/lots#results"
            className="eyebrow transition-colors hover:text-ink"
          >
            {t.home.results}
          </Link>
          <Link href="/about" className="eyebrow transition-colors hover:text-ink">
            {t.nav.about}
          </Link>
          <Link
            href="/contact"
            className="eyebrow transition-colors hover:text-ink"
          >
            {t.nav.contact}
          </Link>
        </nav>
      </div>
      <div className="gutter border-t border-line py-5">
        <p className="text-xs text-faint">
          © {new Date().getFullYear()} {t.brand.name}. {t.footer.rights}.
        </p>
      </div>
    </footer>
  );
}
