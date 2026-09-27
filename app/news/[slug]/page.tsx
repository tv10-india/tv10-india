<<<<<<< HEAD
import { client, urlFor } from "../../../sanityStudio/lib/sanity";
=======
import { client, urlFor, getImageUrl, getOgImageUrl, getJsonLdImages } from "../../../sanityStudio/lib/sanity";
>>>>>>> 176d453 (Update V1.5)
import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Header, { Headline } from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
<<<<<<< HEAD
import AdBanner from "@/components/AdBanner"; 
=======
import AdSlot from "@/components/AdSlot";
import AdBanner from "@/components/AdBanner";
>>>>>>> 176d453 (Update V1.5)
import AudioPlayer from "@/components/AudioPlayer";
import BreakingBadge from "@/components/BreakingBadge";
import Byline, { authorPath } from "@/components/Byline";
import NewsCard from "@/components/NewsCard"; // Ensure this is imported
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
<<<<<<< HEAD
import { FaYoutube, FaClock, FaFire, FaLayerGroup } from "react-icons/fa";

export const revalidate = 60;
=======
import JsonLd from "@/components/JsonLd";
import { categoryLabel, categoryPath } from "@/lib/categories";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";
import { AUTHOR_PROJECTION, LIVE_POST_FILTER, LIVE_POST_ORDER_BY_DATE } from "@/lib/posts";
import { inArticleSplitIndex } from "@/lib/ads";
import type { NewsItem } from "@/types/content";
import { FaYoutube, FaFire, FaLayerGroup } from "react-icons/fa";

export const revalidate = 60;

const siteUrl = SITE_URL;
>>>>>>> 176d453 (Update V1.5)

// 1. RICH TEXT STYLING
const RichTextComponents = {
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4 text-tv10-metal dark:text-white">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-8 mb-4 border-l-4 border-tv10-red pl-3 text-tv10-metal dark:text-tv10-gold">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>,
    normal: ({ children }: any) => <p className="mb-4 text-lg leading-relaxed text-gray-800 dark:text-gray-300 text-justify">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-tv10-gold pl-4 italic text-xl text-gray-600 dark:text-gray-400 my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-r-lg">
        "{children}"
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-10 mb-6 space-y-2 text-lg text-gray-800 dark:text-gray-300 marker:text-tv10-red">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-10 mb-6 space-y-2 text-lg text-gray-800 dark:text-gray-300 marker:font-bold">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="pl-1">{children}</li>,
    number: ({ children }: any) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-black dark:text-white">{children}</strong>,
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a href={value.href} rel={rel} className="text-tv10-red hover:underline font-bold">
          {children}
        </a>
      );
    },
    color: ({ children, value }: any) => (
      <span style={{ color: value?.value }}>{children}</span>
    ),
  },
  types: {
    image: ({ value }: any) => (
      <div className="relative w-full aspect-video my-6 rounded-lg overflow-hidden shadow-md">
        <Image src={urlFor(value).url()} alt={value.alt || ""} fill className="object-cover" />
      </div>
    ),
  },
};

const StyledHeadingComponents = {
  block: {
    normal: ({ children }: any) => <>{children}</>,
  },
  marks: {
    color: ({ children, value }: any) => <span style={{ color: value?.value }}>{children}</span>,
  },
};

// 2. DATA FETCHING
async function getArticle(rawSlug: string) {
  if (!rawSlug) return null;
  const decodedSlug = decodeURIComponent(rawSlug).trim();
  const cleanSlug = decodedSlug.replace(/\/+$/, "");

  const query = `
<<<<<<< HEAD
    *[_type == "post" && (
=======
    *[${LIVE_POST_FILTER} && (
>>>>>>> 176d453 (Update V1.5)
      slug.current == $cleanSlug ||
      slug.current == $cleanSlug + "/" ||
      slug.current == "/" + $cleanSlug ||
      lower(slug.current) == lower($cleanSlug) ||
      lower(slug.current) == lower($cleanSlug) + "/" ||
      lower(slug.current) == " " + lower($cleanSlug) ||
      lower(slug.current) == lower($cleanSlug) + " " ||
      slug.current == $decodedSlug
    )][0] {
      title,
      styledTitle,
      slug,
      mainImage,
      gallery,
      youtubeUrl,
      body,
      publishedAt,
      _updatedAt,
      category,
<<<<<<< HEAD
      "categoryNews": *[_type == "post" && category == ^.category && slug.current != ^.slug.current] | order(publishedAt desc) [0...5] {
        title, slug, mainImage, publishedAt
      },
      "trendingNews": *[_type == "post" && slug.current != ^.slug.current] | order(publishedAt desc) [0...5] {
=======
      seoDescription,
      tags,
      isBreaking,
      ${AUTHOR_PROJECTION},
      "categoryNews": *[${LIVE_POST_FILTER} && category == ^.category && slug.current != ^.slug.current] | ${LIVE_POST_ORDER_BY_DATE} [0...5] {
        title, slug, mainImage, publishedAt
      },
      "trendingNews": *[${LIVE_POST_FILTER} && slug.current != ^.slug.current] | ${LIVE_POST_ORDER_BY_DATE} [0...5] {
>>>>>>> 176d453 (Update V1.5)
        title, slug, mainImage, publishedAt
      }
    }
  `;
  const params = { cleanSlug, decodedSlug };
  return client.fetch(query, params);
}

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

type Props = {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);

  if (!post) {
<<<<<<< HEAD
    return { title: "Article Not Found | TV10 India" };
  }

  const title = `${post.title} | TV10 India`;
  const description = `Read the latest news from TV10 India: ${post.title}`;
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).url()
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
=======
    return { title: "Article Not Found" };
  }

  const description = post.seoDescription || `Read the latest news from TV10 India: ${post.title}`;
  // Use a compressed, fixed-size crop for social previews — full-resolution
  // originals (1-2MB+) get silently dropped by WhatsApp/Facebook crawlers.
  const imageUrl = getOgImageUrl(post.mainImage);
  const articleUrl = `${siteUrl}/news/${post.slug?.current || slug}`;

  return {
    title: post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: post.title,
      description,
      url: articleUrl,
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
>>>>>>> 176d453 (Update V1.5)
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getArticle(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const videoId = post.youtubeUrl ? getYouTubeId(post.youtubeUrl) : null;
  const headlines: Headline[] = (post.trendingNews || []).map((item: { title: string; slug?: { current?: string } }) => ({
    title: item.title,
    slug: item.slug?.current || "",
  }));
<<<<<<< HEAD

  return (
    <main className="bg-[#f4f4f4] dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 font-sans">
=======

  const sectionLabel = categoryLabel(post.category);
  const sectionPath = categoryPath(post.category);
  const relatedNews: NewsItem[] = (post.categoryNews?.length > 0 ? post.categoryNews : post.trendingNews) || [];

  // Where the in-article ad breaks the body, or null on a story too short to
  // carry one without crowding the sidebar and below-article units.
  const bodySplit = inArticleSplitIndex(post.body);

  const articleUrl = `${siteUrl}/news/${post.slug?.current || resolvedParams.slug}`;
  const description = post.seoDescription || `Read the latest news from TV10 India: ${post.title}`;

  // A named Person beats the masthead here: Google scores news on evidence that a
  // real, identifiable journalist wrote the piece, and `url` is what ties the
  // byline to the profile page carrying their bio and other work. Articles from
  // before staff profiles existed keep the Organization credit rather than
  // claiming an author who is not recorded.
  const authorProfile = authorPath(post.author);
  const articleAuthor = post.author?.name
    ? {
        "@type": "Person",
        name: post.author.name,
        ...(post.author.designation ? { jobTitle: post.author.designation } : {}),
        ...(authorProfile ? { url: `${siteUrl}${authorProfile}` } : {}),
      }
    : { "@type": "Organization", name: SITE_NAME, url: siteUrl };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    // Google truncates headlines past ~110 characters in rich results.
    headline: (post.title || "").slice(0, 110),
    description,
    image: getJsonLdImages(post.mainImage, SITE_LOGO),
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    articleSection: sectionLabel,
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    inLanguage: "hi",
    author: articleAuthor,
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      // mystery has no category page, so that level is skipped.
      ...(sectionPath
        ? [{ "@type": "ListItem", position: 2, name: sectionLabel, item: `${siteUrl}${sectionPath}` }]
        : []),
      { "@type": "ListItem", position: sectionPath ? 3 : 2, name: post.title, item: articleUrl },
    ],
  };

  return (
    <main className="bg-[#f4f4f4] dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 font-sans">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

>>>>>>> 176d453 (Update V1.5)
      <Header initialHeadlines={headlines} />

      <div className="container mx-auto px-4 py-8 max-w-[1400px]">

        {/* --- AD SLOT 1: LEADERBOARD --- */}
        <div className="mb-6">
           <AdSlot slot="header-leaderboard" category={post.category} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: MORE NEWS */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
             <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border-t-4 border-tv10-gold">
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
                 <FaLayerGroup className="text-tv10-gold" /> More in {sectionLabel}
               </h3>
               <div className="space-y-4">
<<<<<<< HEAD
                 {(post.categoryNews?.length > 0 ? post.categoryNews : post.trendingNews)?.map((item: any, index: number) => {
                   const itemSlug = item.slug?.current;
                   if (!itemSlug) return null;
                   const imageUrl = item.mainImage ? urlFor(item.mainImage).url() : null;
                   return (
                     <Link href={`/news/${itemSlug}`} key={itemSlug || index} className="flex gap-3 group items-start border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                        <div className="w-16 h-12 relative flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                           {imageUrl && (
                             <Image
                               src={imageUrl}
                               alt={item.title || "news"}
                               fill
                               className="object-cover group-hover:scale-105 transition duration-300"
                             />
                           )}
=======
                 {relatedNews.map((item: NewsItem, index: number) => {
                   const itemSlug = item.slug?.current;
                   if (!itemSlug) return null;
                   const imageUrl = getImageUrl(item.mainImage);
                   return (
                     <Link href={`/news/${itemSlug}`} key={itemSlug || index} className="flex gap-3 group items-start border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                        <div className="w-16 h-12 relative flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                           <Image
                             src={imageUrl}
                             alt={item.title || "news"}
                             fill
                             className={item.mainImage ? "object-cover group-hover:scale-105 transition duration-300" : "object-contain p-1 opacity-60"}
                           />
>>>>>>> 176d453 (Update V1.5)
                        </div>
                        <div className="flex-1">
                           <h4 className="text-xs font-bold leading-tight group-hover:text-tv10-red line-clamp-2 text-gray-800 dark:text-gray-200 mb-1">
                             {item.title}
                           </h4>
                           {item.publishedAt && (
                             <span className="text-[10px] text-gray-400 block">
                               {new Date(item.publishedAt).toLocaleDateString()}
                             </span>
                           )}
                        </div>
                     </Link>
                   );
                 })}
               </div>
             </div>
          </aside>

          {/* CENTER COLUMN: MAIN ARTICLE */}
          <article className="lg:col-span-6 bg-white dark:bg-[#1a1a1a] p-5 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-fit">
            
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-tv10-red mb-3">
               <Link href="/" className="hover:underline">Home</Link> /
               {sectionPath
                 ? <Link href={sectionPath} className="text-gray-500 hover:underline">{sectionLabel}</Link>
                 : <span className="text-gray-500">{sectionLabel}</span>}
            </div>

            {post.isBreaking && <BreakingBadge className="mb-3" />}

            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4 text-black dark:text-white">
              {post.styledTitle?.length > 0
                ? <PortableText value={post.styledTitle} components={StyledHeadingComponents} />
                : post.title}
            </h1>

<<<<<<< HEAD
            {/* DATE & SHARE BAR */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
               <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm font-medium">
                 <FaClock /> {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
               <div className="flex gap-2">
=======
            {/* DATE & SHARE BAR. Stacks on phones: the share strip is a fixed
                ~184px and cannot shrink, which leaves too little room for the
                byline on a narrow screen and pushes the row past the viewport. */}
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
               <Byline author={post.author} publishedAt={post.publishedAt} />
               <div className="flex gap-2 flex-shrink-0">
>>>>>>> 176d453 (Update V1.5)
                 <WhatsAppShareButton title={post.title} slug={post.slug?.current || ""} />
               </div>
            </div>

            {/* --- AUDIO PLAYER --- */}
            <AudioPlayer text={`${post.title}. ${post.body?.map((b:any) => b.children?.map((c:any) => c.text).join(' ')).join(' ')}`} />

            {/* 1. ALWAYS SHOW IMAGE FIRST */}
            <div className="relative w-full aspect-video mb-6 rounded-lg overflow-hidden shadow-md">
              <Image
                 src={getImageUrl(post.mainImage)}
                 alt={post.title}
                 fill
                 className={post.mainImage ? "object-cover" : "object-contain p-16 opacity-60"}
                 priority
              />
            </div>

            {/* 2. SHOW VIDEO BELOW IMAGE (If it exists) */}
            {videoId && (
              <div className="w-full aspect-video mb-8 rounded-lg overflow-hidden shadow-md bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* 3. ARTICLE CONTENT */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {post.body &&
                (bodySplit === null ? (
                  <PortableText value={post.body} components={RichTextComponents} />
                ) : (
                  <>
                    <PortableText
                      value={post.body.slice(0, bodySplit)}
                      components={RichTextComponents}
                    />
                    {/* not-prose: the native unit carries its own typography,
                        and the prose styles would otherwise restyle the
                        advertiser's headline and link. */}
                    <div className="not-prose">
                      <AdBanner unit="inArticle" />
                    </div>
                    <PortableText
                      value={post.body.slice(bodySplit)}
                      components={RichTextComponents}
                    />
                  </>
                ))}
            </div>

            {/* 4. IMAGE GALLERY */}
            {post.gallery && post.gallery.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 text-tv10-metal dark:text-white">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {post.gallery.map((img: any, i: number) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
                      <Image src={urlFor(img).url()} alt={`${post.title} ${i + 1}`} fill className="object-cover hover:scale-105 transition duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. MORE IN CATEGORY — below lg only; the left sidebar is hidden
                   on phones/tablets, so without this mobile readers get no
                   related articles at all. */}
            {relatedNews.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 lg:hidden">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wide text-tv10-metal dark:text-white">
                  <FaLayerGroup className="text-tv10-gold" /> More in {sectionLabel}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedNews.map((item: NewsItem, index: number) => {
                    const itemSlug = item.slug?.current;
                    if (!itemSlug) return null;
                    return (
                      <Link href={`/news/${itemSlug}`} key={itemSlug || index} className="flex gap-3 group items-start">
                        <div className="w-20 h-16 relative flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                          <Image
                            src={getImageUrl(item.mainImage)}
                            alt={item.title || "news"}
                            fill
                            className={item.mainImage ? "object-cover" : "object-contain p-1 opacity-60"}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold leading-tight group-hover:text-tv10-red line-clamp-3 text-gray-800 dark:text-gray-200">
                            {item.title}
                          </h4>
                          {item.publishedAt && (
                            <span className="text-[10px] text-gray-400 block mt-1">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. MULTIPLEX — a grid of recommended content. It goes in the wide
                   column, where it has room to lay its cards out; the two
                   `article-*` slots are both in the narrow sidebar and would
                   squeeze it. Placed last, after our own "More in ..." block, so
                   the reader gets the newsroom's recommendations before
                   Google's and the article itself is never interrupted by it. */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <AdBanner unit="multiplex" />
            </div>

            {/* 4. IMAGE GALLERY */}
            {post.gallery && post.gallery.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 text-tv10-metal dark:text-white">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {post.gallery.map((img: any, i: number) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
                      <Image src={urlFor(img).url()} alt={`${post.title} ${i + 1}`} fill className="object-cover hover:scale-105 transition duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </article>

          {/* RIGHT COLUMN: ADS & TRENDING */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* --- AD SLOT 2: SIDEBAR TOP --- */}
            <AdSlot slot="article-inline" category={post.category} />

            {/* --- WHATSAPP STATUS GENERATOR --- */}
            <NewsCard post={post} />

            {/* Subscribe Box */}
            <div className="bg-tv10-red text-white p-4 rounded-xl shadow-md text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <FaYoutube className="text-2xl" />
                <span className="font-bold">TV10 India</span>
              </div>
<<<<<<< HEAD
              <p className="text-xs mb-3 opacity-90">Join 43,000+ Subscribers</p>
=======
              <p className="text-xs mb-3 opacity-90">Join 57,000+ Subscribers</p>
>>>>>>> 176d453 (Update V1.5)
              <a href="https://www.youtube.com/@TV10India" target="_blank" rel="noreferrer" className="block w-full bg-white text-tv10-red text-xs font-black px-4 py-2 rounded-full hover:bg-gray-100 transition">
                SUBSCRIBE NOW
              </a>
            </div>

            {/* --- AD SLOT 3: SIDEBAR MIDDLE --- */}
            <AdSlot slot="article-below" category={post.category} />

            {/* Trending News */}
            <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 uppercase tracking-wide">
                 <FaFire className="text-tv10-gold" /> Trending Now
               </h3>
               <div className="space-y-4">
                 {post.trendingNews?.map((item: any, index: number) => {
                   const itemSlug = item.slug?.current;
                   if (!itemSlug) return null;
                   const imageUrl = item.mainImage ? urlFor(item.mainImage).url() : null;
                   return (
                     <Link href={`/news/${itemSlug}`} key={itemSlug || index} className="flex gap-3 group items-start">
                        <div className="w-16 h-12 relative flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                           {imageUrl && <Image src={imageUrl} alt={item.title || "news"} fill className="object-cover" />}
                        </div>
                        <div>
                           <h4 className="text-xs font-bold leading-tight group-hover:text-tv10-red line-clamp-2 text-gray-800 dark:text-gray-200">
                             {item.title}
                           </h4>
                        </div>
                     </Link>
                   );
                 })}
               </div>
            </div>

          </aside>

        </div>

        <AdSlot slot="footer" category={post.category} fallback={false} />
      </div>
    </main>
  );
}
