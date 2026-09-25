/**
 * Initials for a person's name, used by the fallback plates that stand in for
 * a missing portrait. Shared by the committee grid and the alumni directory so
 * both render the same way.
 */
export function initialsOf(name: string) {
  return name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
