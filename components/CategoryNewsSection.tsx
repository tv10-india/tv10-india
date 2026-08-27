import Image from "next/image";
import Link from "next/link";
import { FaBriefcase, FaGlobeAsia, FaTrophy } from "react-icons/fa";
import { urlFor } from "../sanityStudio/lib/sanity";
import type { NewsItem } from "../types/content";

type CategoryConfig = {
  label: string;
  accent: string;
  icon: typeof FaBriefcase;
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  business: { label: "Business & Tech", accent: "text-blue-700", icon: FaBriefcase },
  sports: { label: "Sports", accent: "text-emerald-700", icon: FaTrophy },
  world: { label: "World News", accent: "text-indigo-700", icon: FaGlobeAsia },
};

export default function CategoryNewsSection({
  news,
  category,
}: {
  news: NewsItem[];
  category: keyof typeof CATEGORY_CONFIG;
}) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  const stories = news
    .filter((item) => item.category?.toLowerCase() === category && item.slug?.current)
    .slice(0, 4);

  if (!stories.length) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between border-b-2 border-gray-200 dark:border-gray-700 pb-3 mb-6">
        <h2 className={`flex items-center gap-3 text-2xl md:text-3xl font-black uppercase tracking-tight ${config.accent} dark:text-tv10-gold`}>
          <Icon />
          {config.label}
        </h2>
        <Link href={`/${category}`} className="text-xs font-bold text-tv10-red hover:underline">
          VIEW ALL
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stories.map((story) => (
          <Link href={`/news/${story.slug?.current}`} key={story._id} className="group">
            <article className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-tv10-metal">
              <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
                {story.mainImage ? (
                  <Image
                    src={urlFor(story.mainImage).url()}
                    alt={story.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">TV10 India</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-3 text-base font-bold leading-snug text-gray-900 group-hover:text-tv10-red dark:text-white">
                  {story.title}
                </h3>
                {story.publishedAt && (
                  <time className="mt-3 block text-xs text-gray-400">
                    {new Date(story.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </time>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
