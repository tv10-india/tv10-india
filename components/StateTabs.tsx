"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function StateTabs({ news }: { news: any[] }) {
  const [activeState, setActiveState] = useState("up");

  // DEFINITION: What text should we look for in the database?
  const tabs = [
    { 
      id: "up", 
      label: "Uttar Pradesh", 
      // Allows: "up", "UP", "Uttar Pradesh", "uttar-pradesh"
      match: ["up", "uttar pradesh", "uttar-pradesh"] 
    },
    { 
      id: "uk", 
      label: "Uttarakhand", 
      // Allows: "uk", "UK", "Uttarakhand"
      match: ["uk", "uttarakhand"] 
    },
    { 
      id: "delhi", 
      label: "Delhi", 
      // Allows: "delhi", "Delhi NCR"
      match: ["delhi", "delhi ncr", "new delhi"] 
    },
  ];

  // 1. Get the current active tab definition
  const currentTab = tabs.find((t) => t.id === activeState);

  // 2. Filter news: Check if the category matches ANY of the allowed keywords
  const filteredNews = news.filter((item) => {
    // Convert DB category to lowercase to avoid Case Sensitive errors
    const dbCategory = item.category ? item.category.toLowerCase() : "";
    return currentTab?.match.includes(dbCategory);
  }).slice(0, 3);

  return (
    <section className="container mx-auto px-4 py-12">
      
      {/* SECTION HEADER + TABS */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-gray-200 dark:border-gray-700 mb-8 pb-4">
        <h3 className="text-3xl font-black text-tv10-metal dark:text-white uppercase tracking-tighter flex items-center gap-2 mb-4 md:mb-0">
          <FaMapMarkerAlt className="text-tv10-red" />
          Pradesh <span className="text-gray-400">Samachar</span>
        </h3>
        
        {/* THE TABS */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveState(tab.id)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border-2 ${
                activeState === tab.id
                  ? "bg-tv10-red border-tv10-red text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-tv10-gold hover:text-tv10-gold"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* NEWS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
        
        {filteredNews.length > 0 ? (
          filteredNews.map((story) => (
            <Link href={`/news/${story.slug.current}`} key={story.slug.current} className="group h-full">
              <div className="bg-white dark:bg-tv10-metal rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-700">
                
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden bg-gray-200">
                  {story.mainImage ? (
                    <Image
                      src={urlFor(story.mainImage).url()}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                  {/* Badge */}
                  <span className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
                     {story.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-lg leading-snug text-gray-900 dark:text-white group-hover:text-tv10-red line-clamp-3 mb-4">
                    {story.title}
                  </h4>
                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3">
                     <p className="text-xs text-gray-400 font-semibold">
                       {new Date(story.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                     </p>
                     <span className="text-tv10-gold text-xs font-bold group-hover:translate-x-1 transition">
                        Read Story &rarr;
                     </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-bold text-gray-400">No updates from {activeState.toUpperCase()} yet.</h4>
            <p className="text-sm text-gray-500 mt-2">Check back later for breaking news.</p>
          </div>
        )}

      </div>
    </section>
  );
}