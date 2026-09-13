"use client";

/**
 * Small machined parts used as floating decoration. All share the logo's
 * chrome ramp so they read as pieces of the same object.
 */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="24%" stopColor="#b6bbc2" />
        <stop offset="45%" stopColor="#e4e6ea" />
        <stop offset="66%" stopColor="#5f666e" />
        <stop offset="100%" stopColor="#d4d7dc" />
      </linearGradient>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stopColor="#f9ecc8" />
        <stop offset="38%" stopColor="#d9af4e" />
        <stop offset="70%" stopColor="#85641f" />
        <stop offset="100%" stopColor="#f0d18a" />
      </linearGradient>
    </defs>
  );
}

export function HexBolt({
  className = "",
  gold = false,
}: {
  className?: string;
  gold?: boolean;
}) {
  const id = gold ? "hb-g" : "hb-s";
  const fill = `url(#${id}-${gold ? "gold" : "chrome"})`;
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <Defs id={id} />
      <polygon
        points="50,6 88,28 88,72 50,94 12,72 12,28"
        fill={fill}
        stroke="rgba(0,0,0,.45)"
        strokeWidth="2"
      />
      <polygon
        points="50,20 76,35 76,65 50,80 24,65 24,35"
        fill="none"
        stroke="rgba(0,0,0,.35)"
        strokeWidth="2"
      />
      <circle cx="50" cy="50" r="15" fill="#14171b" />
      <circle
        cx="50"
        cy="50"
        r="15"
        fill="none"
        stroke={fill}
        strokeWidth="3"
      />
    </svg>
  );
}

export function Cog({
  className = "",
  teeth = 12,
  gold = false,
}: {
  className?: string;
  teeth?: number;
  gold?: boolean;
}) {
  const id = gold ? "cg-g" : "cg-s";
  const fill = `url(#${id}-${gold ? "gold" : "chrome"})`;
  return (
    <svg viewBox="-50 -50 100 100" className={className}>
      <Defs id={id} />
      {Array.from({ length: teeth }).map((_, i) => (
        <rect
          key={i}
          x={-5}
          y={-48}
          width={10}
          height={16}
          rx={2}
          fill={fill}
          transform={`rotate(${(360 / teeth) * i})`}
        />
      ))}
      <circle r="36" fill={fill} stroke="rgba(0,0,0,.4)" strokeWidth="2" />
      <circle r="24" fill="#191d22" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect
          key={i}
          x={-4}
          y={-22}
          width={8}
          height={14}
          rx={4}
          fill={fill}
          transform={`rotate(${72 * i})`}
        />
      ))}
      <circle r="8" fill={fill} />
      <circle r="3.5" fill="#0b0d10" />
    </svg>
  );
}

export function Washer({
  className = "",
  gold = false,
}: {
  className?: string;
  gold?: boolean;
}) {
  const id = gold ? "ws-g" : "ws-s";
  const fill = `url(#${id}-${gold ? "gold" : "chrome"})`;
  return (
    <svg viewBox="-50 -50 100 100" className={className}>
      <Defs id={id} />
      <circle r="44" fill={fill} />
      <circle r="22" fill="#191d22" />
      <circle r="33" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="1.5" />
    </svg>
  );
}

export function Wrench({
  className = "",
  gold = false,
}: {
  className?: string;
  gold?: boolean;
}) {
  const id = gold ? "wr-g" : "wr-s";
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <Defs id={id} />
      <g
        fill={`url(#${id}-${gold ? "gold" : "chrome"})`}
        stroke="rgba(0,0,0,.4)"
        strokeWidth="1.5"
      >
        <rect x="44" y="26" width="12" height="62" rx="6" />
        <path d="M50 6a20 20 0 0 0-16 32h32A20 20 0 0 0 50 6Zm0 9a11 11 0 1 1 0 22 11 11 0 0 1 0-22Z" />
      </g>
    </svg>
  );
}
