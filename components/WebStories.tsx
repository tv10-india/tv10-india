import Image from "next/image";
import { urlFor } from "../sanityStudio/lib/sanity";
import { FaBolt } from "react-icons/fa";
import Link from "next/link";

export default function WebStories({ stories }: { stories: any[] }) {
  if (!stories || stories.length === 0) return null;

  return (
    <section className="bg-white dark:bg-tv10-metal border-b border-gray-200 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4">
        
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-3 text-tv10-red font-bold uppercase text-xs tracking-widest">
          <FaBolt />
          <span>Visual Stories</span>
        </div>

        {/* SCROLLABLE STRIP */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          
          {stories.map((story) => (
            <Link href={`/web-stories/${story._id}`} key={story._id}>
              <div className="flex-shrink-0 relative w-28 h-44 md:w-32 md:h-52 rounded-xl overflow-hidden cursor-pointer group border-2 border-transparent hover:border-tv10-gold transition-all">
                
                {/* IMAGE */}
                {story.slides && story.slides[0] && (
                  <Image
                    src={urlFor(story.slides[0]).url()}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-700"
                  />
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                
                {/* TITLE */}
                <div className="absolute bottom-0 left-0 p-2 w-full">
                  <p className="text-white text-[10px] md:text-xs font-bold leading-tight line-clamp-2">
                    {story.title}
                  </p>
                </div>
                
                {/* ICON */}
                <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full backdrop-blur-sm">
                  <div className="w-4 h-4 rounded-full border-2 border-tv10-gold"></div>
                </div>

              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}