import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { FaEye } from "react-icons/fa";

export default function MysterySection({ news }: { news: any[] }) {
  // Filter for 'mystery' category
  const mysteryNews = news.filter((item) => item.category === "mystery").slice(0, 3);

  if (mysteryNews.length === 0) return null;

  return (
    <section className="bg-[#0f020f] py-16 relative overflow-hidden">
      
      {/* MYSTICAL BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-900 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-900 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-900/50 p-4 rounded-full border border-purple-500/30 mb-4 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.4)]">
             <FaEye className="text-3xl text-purple-300" />
          </div>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-sm">
            Adbhut Bharat
          </h3>
          <p className="text-purple-300 tracking-widest text-sm font-bold mt-2 uppercase">
            Miracles • Mysteries • Unexplained
          </p>
        </div>

        {/* 16:9 CINEMATIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {mysteryNews.map((story, index) => (
            <Link href={`/news/${story.slug.current}`} key={story.slug.current} className="group relative block perspective-1000">
               <div className="bg-[#1a051a] rounded-2xl overflow-hidden border border-purple-500/20 shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all duration-500 transform group-hover:-translate-y-2">
                  
                  {/* 1. IMAGE AREA (Fixed 16:9 Ratio) */}
                  <div className="relative w-full aspect-video overflow-hidden">
                     {story.mainImage ? (
                       <Image 
                         src={urlFor(story.mainImage).url()} 
                         alt={story.title} 
                         fill 
                         className="object-cover opacity-90 group-hover:scale-110 transition duration-700 grayscale group-hover:grayscale-0" 
                       />
                     ) : (
                        <div className="w-full h-full bg-gray-900"></div>
                     )}
                     
                     {/* Overlay Badge */}
                     <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_10px_#9333ea] z-10">
                       RAHASYA #{index + 1}
                     </div>

                     {/* Gradient Bottom Fade */}
                     <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#1a051a] to-transparent"></div>
                  </div>

                  {/* 2. TEXT CONTENT (Below Image) */}
                  <div className="p-6 relative">
                     <h4 className="text-xl font-bold leading-snug text-gray-100 group-hover:text-purple-400 transition-colors line-clamp-3">
                       {story.title}
                     </h4>
                     
                     <div className="mt-4 flex items-center justify-between border-t border-purple-500/20 pt-4">
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(story.publishedAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-purple-400 font-bold group-hover:translate-x-1 transition">
                          Reveal Truth &rarr;
                        </span>
                     </div>
                  </div>

               </div>
            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}