import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "../sanityStudio/lib/sanity";
import { FaPlay, FaYoutube } from "react-icons/fa";
<<<<<<< HEAD
import type { NewsItem } from "../types/content";
=======
import type { NewsItem, YouTubeVideo } from "../types/content";
>>>>>>> 176d453 (Update V1.5)

// Helper to extract YouTube ID
function getYouTubeId(url?: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

<<<<<<< HEAD
export default function VideoSection({ news }: { news: NewsItem[] }) {
=======
export default function VideoSection({ news, youtubeVideos }: { news: NewsItem[]; youtubeVideos: YouTubeVideo[] }) {
>>>>>>> 176d453 (Update V1.5)
  // 1. Filter only posts that have a YouTube URL
  const videoNews = news.filter((item) => item.youtubeUrl).slice(0, 4);
  const channelVideos = youtubeVideos.slice(0, 4);
  const videos = channelVideos.length > 0 ? channelVideos : videoNews;

  if (videos.length === 0) return null;

  return (
    <section className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="bg-red-600 p-2 rounded-lg">
               <FaYoutube className="text-2xl text-white" />
             </div>
             <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
               Watch <span className="text-red-600">TV10</span>
             </h3>
          </div>
          <a href="https://www.youtube.com/@TV10India" target="_blank" rel="noreferrer" className="text-xs font-bold border border-gray-600 px-4 py-2 rounded-full hover:bg-red-600 hover:border-red-600 transition">
            VISIT CHANNEL
          </a>
        </div>

        {/* LAYOUT: 1 BIG PLAYER + 3 SIDE CLIPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: MAIN PLAYER (Takes 2 Columns) */}
          <div className="lg:col-span-2">
            {videos[0] && (
              <div className="w-full">
                {/* The Player */}
                <div className="aspect-video w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 mb-4">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${"id" in videos[0] ? videos[0].id : getYouTubeId(videos[0].youtubeUrl)}?rel=0`}
                    title={videos[0].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                {/* The Title */}
                <h2 className="text-xl md:text-2xl font-bold leading-tight hover:text-red-500 transition cursor-pointer">
                  {"id" in videos[0] ? (
                    <a href={`https://www.youtube.com/watch?v=${videos[0].id}`} target="_blank" rel="noreferrer">
                      {videos[0].title}
                    </a>
                  ) : (
                    <Link href={`/news/${videos[0].slug.current}`}>{videos[0].title}</Link>
                  )}
                </h2>
              </div>
            )}
          </div>

          {/* RIGHT: PLAYLIST (Takes 1 Column) */}
          <div className="flex flex-col gap-4 h-full">
            {videos.slice(1, 4).map((video) => {
              const isChannelVideo = "id" in video;
              const videoHref = isChannelVideo ? `https://www.youtube.com/watch?v=${video.id}` : `/news/${video.slug.current}`;
              return <a href={videoHref} target={isChannelVideo ? "_blank" : undefined} rel={isChannelVideo ? "noreferrer" : undefined} key={isChannelVideo ? video.id : video.slug.current} className="flex gap-3 group bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-red-600 transition">
                
                {/* Thumbnail */}
                <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden">
                  <Image 
                    src={isChannelVideo ? video.thumbnailUrl : getImageUrl(video.mainImage)} 
                    alt={video.title} 
                    fill 
                    className={isChannelVideo || video.mainImage ? "object-cover group-hover:scale-110 transition" : "object-contain p-3 opacity-60"} 
                  />
                  {/* Tiny Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition">
                    <FaPlay className="text-white text-xs drop-shadow-md" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col justify-center">
                   <h4 className="text-sm font-bold leading-snug text-gray-200 group-hover:text-red-500 line-clamp-2">
                     {video.title}
                   </h4>
                   <p className="text-[10px] text-gray-500 mt-1 uppercase">Watch Now</p>
                </div>

              </a>;
            })}
          </div>

        </div>

      </div>
    </section>
  );
}