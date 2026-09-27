import Image from "next/image";
import Link from "next/link";
import { FaClock } from "react-icons/fa";
import { getAvatarUrl } from "@/sanityStudio/lib/sanity";
import { SITE_NAME } from "@/lib/site";
import type { Author } from "@/types/content";

const AVATAR_SIZE = 40;

/**
 * The article byline.
 *
 * `author` is a required field on new articles, but it is optional here on
 * purpose: the 371-article archive predates the field, and an article that
 * slipped through a backfill should still render — attributed to the masthead,
 * which is what it was attributed to before staff profiles existed.
 */
export function authorPath(author?: Author | null): string | null {
  const slug = author?.slug?.current;
  return slug ? `/author/${slug}` : null;
}

export default function Byline({
  author,
  publishedAt,
}: {
  author?: Author | null;
  publishedAt?: string;
}) {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const name = author?.name?.trim();
  const href = authorPath(author);
  const avatar = getAvatarUrl(author?.photo, AVATAR_SIZE);

  // No profile at all — the pre-staff-profiles shape: a masthead credit and a date.
  if (!name) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm font-medium">
        <FaClock />
        <span>
          {SITE_NAME}
          {date ? ` · ${date}` : ""}
        </span>
      </div>
    );
  }

  const nameEl = href ? (
    <Link href={href} className="font-bold text-tv10-metal dark:text-white hover:text-tv10-red hover:underline">
      {name}
    </Link>
  ) : (
    <span className="font-bold text-tv10-metal dark:text-white">{name}</span>
  );

  return (
    <div className="flex items-center gap-3 min-w-0">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          className="rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
        />
      ) : (
        // Initials rather than the site logo: a masthead badge where a face
        // should be reads as a broken image, not as a design choice.
        <span
          aria-hidden
          className="flex items-center justify-center rounded-full bg-tv10-red text-white text-xs font-black flex-shrink-0"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-xs md:text-sm">
          <span className="text-gray-500">By </span>
          {nameEl}
        </span>
        <span className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-gray-500">
          {author?.designation && (
            <>
              <span>{author.designation}</span>
              <span aria-hidden>·</span>
            </>
          )}
          {date && (
            <>
              <FaClock aria-hidden />
              <span className="whitespace-nowrap">{date}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
