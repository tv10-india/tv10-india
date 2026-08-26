import { client, urlFor } from "../../../sanityStudio/lib/sanity";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Header, { Headline } from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdBanner from "@/components/AdBanner"; 
import AudioPlayer from "@/components/AudioPlayer";
import NewsCard from "@/components/NewsCard"; // Ensure this is imported
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { FaYoutube, FaClock, FaFire, FaLayerGroup } from "react-icons/fa";

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
        <Image src={urlFor(value).url()} alt="" fill className="object-cover" />
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
    *[_type == "post" && (
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
      category,
      "categoryNews": *[_type == "post" && category == ^.category && slug.current != ^.slug.current] | order(publishedAt desc) [0...5] {
        title, slug, mainImage, publishedAt
      },
      "trendingNews": *[_type == "post" && slug.current != ^.slug.current] | order(publishedAt desc) [0...5] {
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

  return (
    <main className="bg-[#f4f4f4] dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 font-sans">
      <Header initialHeadlines={headlines} />

      <div className="container mx-auto px-4 py-8 max-w-[1400px]">

        {/* --- AD SLOT 1: LEADERBOARD --- */}
        <div className="mb-6">
           <AdBanner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: MORE NEWS */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
             <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border-t-4 border-tv10-gold">
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
                 <FaLayerGroup className="text-tv10-gold" /> More in {post.category || "News"}
               </h3>
               <div className="space-y-4">
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
               <span className="text-gray-500">{post.category || "News"}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4 text-black dark:text-white">
              {post.styledTitle?.length > 0
                ? <PortableText value={post.styledTitle} components={StyledHeadingComponents} />
                : post.title}
            </h1>

            {/* DATE & SHARE BAR */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
               <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm font-medium">
                 <FaClock /> {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
               <div className="flex gap-2">
                 <WhatsAppShareButton title={post.title} slug={post.slug?.current || ""} />
               </div>
            </div>

            {/* --- AUDIO PLAYER --- */}
            <AudioPlayer text={`${post.title}. ${post.body?.map((b:any) => b.children?.map((c:any) => c.text).join(' ')).join(' ')}`} />

            {/* 1. ALWAYS SHOW IMAGE FIRST */}
            {post.mainImage && (
              <div className="relative w-full aspect-video mb-6 rounded-lg overflow-hidden shadow-md">
                <Image
                   src={urlFor(post.mainImage).url()}
                   alt={post.title}
                   fill
                   className="object-cover"
                   priority
                />
              </div>
            )}

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
              {post.body && <PortableText value={post.body} components={RichTextComponents} />}
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
            <AdBanner />

            {/* --- WHATSAPP STATUS GENERATOR --- */}
            <NewsCard post={post} />

            {/* Subscribe Box */}
            <div className="bg-tv10-red text-white p-4 rounded-xl shadow-md text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <FaYoutube className="text-2xl" />
                <span className="font-bold">TV10 India</span>
              </div>
              <p className="text-xs mb-3 opacity-90">Join 43,000+ Subscribers</p>
              <a href="https://www.youtube.com/@TV10India" target="_blank" className="block w-full bg-white text-tv10-red text-xs font-black px-4 py-2 rounded-full hover:bg-gray-100 transition">
                SUBSCRIBE NOW
              </a>
            </div>

            {/* --- AD SLOT 3: SIDEBAR MIDDLE --- */}
            <AdBanner />

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
      </div>
    </main>
  );
}
