import { client, urlFor } from "../../../sanityStudio/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { FaTimes, FaArrowRight, FaArrowLeft } from "react-icons/fa";

// 1. Fetch the Story Data
async function getStory(id: string) {
  const query = `*[_type == "webStory" && _id == $id][0]`;
  return client.fetch(query, { id });
}

// 2. Client Component Wrapper (To handle clicks)
// Since this is a server component, we will implement a simple CSS scroll snap 
// or basic interactivity. For full "Tap" logic, we usually use a client component.
// Here is a "No-Code" friendly version using CSS Scroll Snap (Simplest & Fastest).

type Props = {
  params: Promise<{ id: string }>;
}

export default async function WebStoryViewer({ params }: Props) {
  const resolvedParams = await params;
  const story = await getStory(resolvedParams.id);

  if (!story) return <div className="text-white text-center pt-20">Story not found</div>;

  return (
    <main className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
      
      {/* CLOSE BUTTON */}
      <Link href="/" className="absolute top-4 right-4 z-50 text-white bg-black/50 p-2 rounded-full hover:bg-white/20">
        <FaTimes size={24} />
      </Link>

      {/* MOBILE CONTAINER */}
      <div className="relative w-full h-full md:w-[400px] md:h-[800px] bg-gray-900 md:rounded-2xl overflow-hidden shadow-2xl">
        
        {/* SCROLLABLE SLIDES (Snap Effect) */}
        <div className="flex overflow-x-auto w-full h-full snap-x snap-mandatory scrollbar-hide">
          
          {story.slides?.map((slide: any, index: number) => (
            <div key={index} className="w-full h-full flex-shrink-0 snap-center relative">
              
              {/* IMAGE */}
              <div className="relative w-full h-full">
                <Image
                  src={urlFor(slide).url()}
                  alt="Story Slide"
                  fill
                  className="object-cover"
                />
              </div>

              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

              {/* CONTENT */}
              <div className="absolute bottom-10 left-0 w-full p-6 text-center">
                <h2 className="text-white font-bold text-xl drop-shadow-md mb-2">{story.title}</h2>
                {slide.caption && (
                  <p className="text-gray-200 text-sm">{slide.caption}</p>
                )}
                <div className="mt-4 text-white/50 text-xs">
                  Swipe for next &rarr;
                </div>
              </div>

            </div>
          ))}

        </div>

      </div>
    </main>
  );
}