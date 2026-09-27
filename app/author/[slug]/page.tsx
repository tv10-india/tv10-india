import { client, getImageUrl, getAvatarUrl } from "../../../sanityStudio/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import Header, { Headline } from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { AUTHOR_POST_FILTER, LIVE_POST_ORDER_BY_DATE } from "@/lib/posts";
import type { Author, NewsItem } from "@/types/content";

export const revalidate = 60;

const siteUrl = SITE_URL;

const POSTS_PER_PAGE = 9;

const PHOTO_SIZE = 128;

type AuthorPageData = {
  author: Author | null;
  posts: NewsItem[];
  total: number;
};

async function getAuthorPage(authorSlug: string, page: number): Promise<AuthorPageData> {
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  // One round trip for the profile, the page of articles and the count — the
  // same shape the category page uses, so pagination behaves identically.
  const query = `
    {
      "author": *[_type == "author" && slug.current == $authorSlug][0]{
        _id, name, slug, designation, photo, bio, socialLinks
      },
      "posts": *[${AUTHOR_POST_FILTER}] | ${LIVE_POST_ORDER_BY_DATE} [$start...$end] {
        title, slug, mainImage, publishedAt, category
      },
      "total": count(*[${AUTHOR_POST_FILTER}])
    }
  `;
  return client.fetch(query, { authorSlug, start, end }, { next: { revalidate: 60 } });
}

/** "https://twitter.com/tv10india" -> "twitter.com". Enough of a label to tell
 * the links apart without hardcoding a list of platforms that will go stale. */
function linkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { author } = await getAuthorPage(slug, 1);

  if (!author) return { title: "Not Found" };

  const title = author.designation ? `${author.name}, ${author.designation}` : author.name;
  const description =
    author.bio || `Read the latest news and analysis by ${author.name} on ${SITE_NAME}.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/author/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/author/${slug}`,
      type: "profile",
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  const { author, posts, total } = await getAuthorPage(slug, currentPage);

  if (!author) {
    notFound();
  }

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const photo = getAvatarUrl(author.photo, PHOTO_SIZE);
  const socialLinks = (author.socialLinks || []).filter(Boolean);

  const headlines: Headline[] = (posts || []).map((story) => ({
    title: story.title,
    slug: story.slug?.current || "",
  }));

  // ProfilePage wrapping a Person is the pairing Google documents for author
  // pages; `sameAs` is what lets it reconcile this byline with the same
  // journalist elsewhere on the web.
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: author.name,
      url: `${siteUrl}/author/${slug}`,
      ...(author.designation ? { jobTitle: author.designation } : {}),
      ...(author.bio ? { description: author.bio } : {}),
      ...(photo ? { image: photo } : {}),
      ...(socialLinks.length ? { sameAs: socialLinks } : {}),
      worksFor: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: SITE_NAME },
    },
  };

  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <JsonLd data={profileJsonLd} />
      <Header initialHeadlines={headlines} />

      <div className="container mx-auto px-4 py-10">

        {/* PROFILE HEADER */}
        <div className="mx-auto mb-12 max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-tv10-metal md:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
            {photo ? (
              <Image
                src={photo}
                alt={author.name}
                width={PHOTO_SIZE}
                height={PHOTO_SIZE}
                className="flex-shrink-0 rounded-full border-4 border-tv10-gold object-cover"
                priority
              />
            ) : (
              <span
                aria-hidden
                className="flex flex-shrink-0 items-center justify-center rounded-full bg-tv10-red text-4xl font-black text-white"
                style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
              >
                {author.name.slice(0, 1).toUpperCase()}
              </span>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-black uppercase tracking-tight text-tv10-metal dark:text-white md:text-4xl">
                {author.name}
              </h1>
              {author.designation && (
                <p className="mt-1 text-sm font-bold uppercase tracking-widest text-tv10-red">
                  {author.designation}
                </p>
              )}
              {author.bio && (
                <p className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">{author.bio}</p>
              )}

              {socialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {socialLinks.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 transition hover:bg-tv10-gold hover:text-black dark:bg-gray-800 dark:text-gray-300"
                    >
                      {linkLabel(url)}
                    </a>
                  ))}
                </div>
              )}

              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {total} {total === 1 ? "story" : "stories"}
                {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ARTICLES BY THIS AUTHOR */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((story) => (
                <Link
                  href={`/news/${story.slug?.current || ""}`}
                  key={story.slug?.current || story.title}
                  className="group mx-auto h-full w-full max-w-md"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-tv10-metal">
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                      <Image
                        src={getImageUrl(story.mainImage)}
                        alt={story.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={
                          story.mainImage
                            ? "object-cover transition duration-700 group-hover:scale-105"
                            : "object-contain p-8 opacity-60"
                        }
                      />
                      <span className="absolute bottom-2 right-2 rounded-full bg-tv10-red px-3 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
                        {story.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col items-center p-6 text-center">
                      <h3 className="mb-4 line-clamp-3 text-xl font-bold leading-tight text-gray-900 group-hover:text-tv10-gold dark:text-white">
                        {story.title}
                      </h3>
                      <div className="mb-4 h-1 w-12 rounded bg-tv10-gold opacity-50"></div>
                      <div className="mt-auto flex w-full flex-col items-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold uppercase tracking-wide">
                          {story.publishedAt
                            ? new Date(story.publishedAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                        <span className="mt-1 font-bold text-tv10-red group-hover:underline">
                          Read Full Story
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-16 flex justify-center gap-4">
              {currentPage > 1 && (
                <Link
                  href={`/author/${slug}?page=${currentPage - 1}`}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-bold shadow-sm transition hover:bg-tv10-gold hover:text-black dark:border-gray-700 dark:bg-gray-800"
                >
                  <FaArrowLeft /> Previous
                </Link>
              )}

              {currentPage < totalPages && (
                <Link
                  href={`/author/${slug}?page=${currentPage + 1}`}
                  className="flex items-center gap-2 rounded-full bg-tv10-red px-6 py-3 font-bold text-white shadow-lg transition hover:bg-red-700"
                >
                  Next Page <FaArrowRight />
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold text-gray-400">
              No published stories by {author.name} yet.
            </h2>
            <Link href="/" className="mt-4 inline-block font-bold text-tv10-red hover:underline">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
