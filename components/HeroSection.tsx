import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import { FaPlay, FaClock, FaBolt } from "react-icons/fa";

export default function HeroSection({ news }: { news: any[] }) {
  if (!news || news.length === 0) return null;

  const mainStory = news[0];
  const sideStories = news.slice(1, 5);

  return (
    <section className="container mx-auto px-4 py-8">
      
      {/* SECTION TITLE */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
        <span className="bg-tv10-red text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
        <h2 className="text-xl font-bold text-tv10-metal dark:text-white uppercase tracking-wider">
          Top Stories
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: MAIN STORY (Cinematic 8 Cols) */}
        <div className="lg:col-span-8 group cursor-pointer relative">
          <Link href={`/news/${mainStory.slug.current}`}>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
              {/* Image with Zoom Effect */}
              {mainStory.mainImage && (
                <Image
                  src={urlFor(mainStory.mainImage).url()}
                  alt={mainStory.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              
              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

              {/* Play Button */}
              {mainStory.youtubeUrl && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-tv10-red/90 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition">
                  <FaPlay className="ml-1 text-2xl" />
                </div>
              )}

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <span className="inline-block bg-tv10-gold text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-3 shadow-sm">
                  {mainStory.category || "Breaking"}
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg mb-2">
                  {mainStory.title}
                </h1>
                <div className="flex items-center text-gray-300 text-xs gap-3">
                  <span className="flex items-center gap-1"><FaClock /> {new Date(mainStory.publishedAt).toDateString()}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* RIGHT: SIDE STORIES (Clean List 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-4 lg:space-y-0">
          {sideStories.map((story) => (
            <Link href={`/news/${story.slug.current}`} key={story.slug.current} className="flex-1">
              <div className="flex gap-4 items-start group p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                
                {/* Thumbnail (Fixed Size) */}
                <div className="relative w-24 h-24 md:w-32 md:h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                  {story.mainImage && (
                    <Image
                      src={urlFor(story.mainImage).url()}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  {story.youtubeUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <FaPlay className="text-white text-xs" />
                    </div>
                  )}
                </div>

                {/* Headline */}
                <div className="flex flex-col justify-center h-full">
                   <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-tv10-red line-clamp-2">
                     {story.title}
                   </h3>
                   <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase flex items-center gap-1">
                     <FaBolt className="text-tv10-gold" /> {story.category}
                   </span>
                </div>

              </div>
              {/* Divider Line */}
              <div className="h-[1px] bg-gray-100 dark:bg-gray-800 mx-3 my-1 lg:hidden"></div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}