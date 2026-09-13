import Image from "next/image";
import { site } from "@/content/site";

/**
 * The chrome MD monogram. The source JPEG shipped on a black background, so a
 * keyed transparent PNG lives beside it — that version sits correctly on the
 * silver sections as well as the dark ones.
 */
export function Logo({
  className = "",
  size = 34,
  showWordmark = true,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <a
      href="#top"
      aria-label={`${site.name} — back to top`}
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <span
        className="relative block shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo/mech-logo.png"
          alt=""
          fill
          sizes="80px"
          priority
          className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:rotate-[18deg]"
        />
      </span>
      {showWordmark && (
        <span className="hidden leading-none sm:block">
          <span className="text-chrome font-display block text-base font-semibold tracking-tight">
            {site.shortName}
          </span>
          <span className="text-ink-faint mt-1 block text-[9px] font-medium tracking-[0.22em] uppercase">
            Association
          </span>
        </span>
      )}
    </a>
  );
}
