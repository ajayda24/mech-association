import Image from "next/image";
import { site } from "@/content/site";

/**
 * Brand lockup: the chrome MD monogram plus the "Royal Mech" wordmark.
 *
 * The wordmark is set in the brand face (Cinzel), matching the loading
 * screen, but in a SOLID colour rather than `text-chrome`. At this size small
 * text needs 4.5:1 and a metallic gradient has light bands that cannot reach
 * it — the face is what makes it decorative, not the fill.
 *
 * The source logo shipped as a JPEG on a black background, so a keyed
 * transparent PNG lives beside it — that version sits correctly on the silver
 * sections as well as the dark ones.
 */
export function Logo({
  className = "",
  size = 32,
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
      className={`group inline-flex items-center gap-2.5 ${className}`}
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
        <span className="leading-none">
          {/* `text-brand` carries Cinzel's uppercasing and its open tracking;
              inscriptional caps need the letterspacing to breathe. */}
          <span className="text-brand text-ink block text-[13px] whitespace-nowrap sm:text-[15px]">
            {site.name}
          </span>
          {/* The descriptor only earns its space once there's room for it. */}
          <span className="text-ink-muted mt-[4px] hidden text-[8px] font-medium tracking-[0.2em] whitespace-nowrap uppercase sm:block">
            {site.sub}
          </span>
        </span>
      )}
    </a>
  );
}
