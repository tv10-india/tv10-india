import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { FaOm, FaStar } from "react-icons/fa";

export default function DharmaSection({ news }: { news: any[] }) {
  const dharmaNews = news.filter((item) => item.category === "dharma").slice(0, 4);

  if (dharmaNews.length === 0) return null;

  return (
    <section className="relative bg-gradient-to-b from-[#2c0b0e] to-black text-white pt-20 pb-16 mt-12">
      
      {/* --- PREMIUM GOLD SEPARATOR (Replaces the Wave) --- */}
      {/* 1. The Gold Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tv10-metal via-tv10-gold to-tv10-metal shadow-[0_0_20px_rgba(255,215,0,0.6)]"></div>
      
      {/* 2. The Center "OM" Badge (Floats on the line) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-[#2c0b0e] border-4 border-tv10-gold p-3 rounded-full shadow-2xl">
          <FaOm className="text-3xl text-tv10-gold" />
        </div>
      </div>

      {/* --- BACKGROUND GLOW --- */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-tv10-red rounded-full blur-[100px]"></div>
        <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-tv10-gold rounded-full blur-[80px] opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
             <div>
               <h3 className="text-3xl font-black tracking-tight uppercase text-tv10-gold drop-shadow-md">Dharma & Sanskriti</h3>
               <p className="text-xs text-gray-400 tracking-widest font-medium">The Spiritual Soul of Bharat</p>
             </div>
          </div>
          <Link href="/dharma" className="hidden md:block border border-tv10-gold/50 text-tv10-gold px-6 py-2 rounded-full text-xs font-bold hover:bg-tv10-gold hover:text-black transition duration-300">
            VIEW ALL
          </Link>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: FEATURED STORY */}
          {dharmaNews[0] && (
            <Link href={`/news/${dharmaNews[0].slug.current}`} className="group relative h-[450px] rounded-2xl overflow-hidden shadow-2xl block border border-white/10">
               {dharmaNews[0].mainImage && (
                 <Image 
                   src={urlFor(dharmaNews[0].mainImage).url()} 
                   alt={dharmaNews[0].title} 
                   fill 
                   className="object-cover group-hover:scale-105 transition duration-700" 
                 />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
               
               <div className="absolute bottom-0 p-8 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-tv10-gold text-black text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">
                      FEATURED
                    </span>
                    <span className="text-gray-300 text-xs flex items-center gap-1">
                      <FaStar className="text-tv10-gold text-[10px]" /> Must Read
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg text-white group-hover:text-tv10-gold transition-colors">
                    {dharmaNews[0].title}
                  </h2>
               </div>
            </Link>
          )}

          {/* RIGHT: LIST */}
          <div className="flex flex-col justify-between gap-4 h-full">
            {dharmaNews.slice(1, 4).map((story) => (
              <Link href={`/news/${story.slug.current}`} key={story.slug.current} className="flex-1 flex gap-4 items-center group bg-white/5 p-4 rounded-xl hover:bg-white/10 transition border border-white/5 hover:border-tv10-gold/30">
                <div className="w-28 h-full relative flex-shrink-0 rounded-lg overflow-hidden border border-white/10 group-hover:border-tv10-gold/50 transition">
                  {story.mainImage && (
                    <Image src={urlFor(story.mainImage).url()} alt={story.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex flex-col justify-center h-full">
                   <h4 className="text-base md:text-lg font-bold leading-snug text-gray-100 group-hover:text-tv10-gold line-clamp-2 transition-colors">
                     {story.title}
                   </h4>
                   <p className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wide">
                     {new Date(story.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                   </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}