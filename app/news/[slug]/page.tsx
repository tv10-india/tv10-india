import { client, urlFor } from "../../../sanityStudio/lib/sanity";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import AdBanner from "@/components/AdBanner"; 
import AudioPlayer from "@/components/AudioPlayer";
import NewsCard from "@/components/NewsCard"; // Ensure this is imported
import { FaYoutube, FaWhatsapp, FaShareAlt, FaClock, FaFire, FaLayerGroup } from "react-icons/fa";

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
  },
};

// 2. DATA FETCHING
async function getArticle(slug: string) {
  const query = `
    *[_type == "post" && slug.current == $slug][0] {
      title,
      slug,        // <--- ADDED THIS LINE (Fixes the crash)
      mainImage,
      youtubeUrl,
      body,
      publishedAt,
      category,
      "categoryNews": *[_type == "post" && category == ^.category && slug.current != $slug] | order(publishedAt desc) [0...5] {
        title, slug, mainImage, publishedAt
      },
      "trendingNews": *[_type == "post" && slug.current != $slug] | order(publishedAt desc) [0...5] {
        title, slug, mainImage, publishedAt
      }
    }
  `;
  const params = { slug: slug };
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

  if (!post) return <div className="p-20 text-center">Loading...</div>;

  const videoId = post.youtubeUrl ? getYouTubeId(post.youtubeUrl) : null;

  return (
    <main className="bg-[#f4f4f4] dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 font-sans">
      <Header />

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
                 {post.categoryNews?.map((item: any) => (
                   <Link href={`/news/${item.slug.current}`} key={item.slug.current} className="group block">
                      <h4 className="text-xs font-bold leading-snug group-hover:text-tv10-red mb-1">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 block border-b border-gray-100 dark:border-gray-800 pb-2">
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                   </Link>
                 ))}
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
              {post.title}
            </h1>

            {/* DATE & SHARE BAR */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
               <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm font-medium">
                 <FaClock /> {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
               <div className="flex gap-2">
                 <button className="bg-[#25D366] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-green-600 transition">
                     <FaWhatsapp className="text-sm" /> Share
                 </button>
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
                 {post.trendingNews?.map((item: any) => (
                   <Link href={`/news/${item.slug.current}`} key={item.slug.current} className="flex gap-3 group items-start">
                      <div className="w-16 h-12 relative flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                         {item.mainImage && <Image src={urlFor(item.mainImage).url()} alt="news" fill className="object-cover" />}
                      </div>
                      <div>
                         <h4 className="text-xs font-bold leading-tight group-hover:text-tv10-red line-clamp-2 text-gray-800 dark:text-gray-200">
                           {item.title}
                         </h4>
                      </div>
                   </Link>
                 ))}
               </div>
            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}