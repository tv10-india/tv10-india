import { FaBolt } from "react-icons/fa";

/**
 * Renders the `isBreaking` flag from the post schema.
 *
 * That field has been on `post` since the beginning and nothing ever read it —
 * ticking "🔴 Breaking News?" in the Studio changed nothing on the site. This is
 * what makes the control mean something.
 */
export default function BreakingBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-tv10-red px-3 py-1 text-[10px] font-bold uppercase text-white shadow-sm ${className}`}
    >
      <FaBolt aria-hidden="true" /> Breaking
    </span>
  );
}
