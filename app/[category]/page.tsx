import { client, urlFor } from "../../sanityStudio/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const POSTS_PER_PAGE = 9;

const categoryMap: { [key: string]: string } = {
  "uttar-pradesh": "up",
  "uttarakhand": "uk",
  "delhi": "delhi",
  "dharma": "dharma",
  "business": "business",
  "sports": "sports",
  "videos": "videos"
};

async function getCategoryNews(category: string, page: number) {
  const dbCode = categoryMap[category] || category;
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const query = `
    {
      "posts": *[_type == "post" && category == $dbCode] | order(publishedAt desc) [$start...$end] {
        title, slug, mainImage, publishedAt, category
      },
      "total": count(*[_type == "post" && category == $dbCode])
    }
  `;
  return client.fetch(query, { dbCode, start, end });
}

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categoryName = resolvedParams.category;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  const data = await getCategoryNews(categoryName, currentPage);
  const { posts, total } = data;

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />

      <div className="container mx-auto px-4 py-10">
        
        {/* PAGE TITLE (Centered) */}
        <div className="flex flex-col items-center mb-10 border-b-4 border-tv10-red pb-4 max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase text-tv10-metal dark:text-white tracking-tighter mb-2">
            {categoryName.replace('-', ' ')} News
          </h1>
          <span className="text-sm text-gray-500 font-bold bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* PREMIUM NEWS GRID (Centered Items) */}
        {posts.length > 0 ? (
          <>
            {/* Added 'justify-center' to center the whole grid if few items exist */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
              {posts.map((story: any) => (
                <Link href={`/news/${story.slug.current}`} key={story.slug.current} className="group h-full max-w-md mx-auto w-full">
                  <div className="bg-white dark:bg-tv10-metal rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                    
                    {/* Image Container */}
                    <div className="relative w-full aspect-video overflow-hidden bg-gray-200">
                      {story.mainImage ? (
                        <Image
                          src={urlFor(story.mainImage).url()}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <span className="absolute bottom-2 right-2 bg-tv10-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-lg">
                        {story.category}
                      </span>
                    </div>

                    {/* Content (Centered Text) */}
                    <div className="p-6 flex flex-col flex-1 items-center text-center">
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-tv10-gold mb-4 line-clamp-3">
                        {story.title}
                      </h3>
                      
                      {/* Divider Line */}
                      <div className="w-12 h-1 bg-tv10-gold rounded mb-4 opacity-50"></div>
                      
                      {/* Date & Link */}
                      <div className="mt-auto flex flex-col items-center gap-2 text-xs text-gray-500 w-full">
                        <span className="font-semibold tracking-wide uppercase">
                          {new Date(story.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-tv10-red font-bold group-hover:underline mt-1">
                          Read Full Story
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>

            {/* PAGINATION (Centered) */}
            <div className="flex justify-center gap-4 mt-16">
              {currentPage > 1 && (
                <Link 
                  href={`/${categoryName}?page=${currentPage - 1}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full font-bold hover:bg-tv10-gold hover:text-black transition shadow-sm"
                >
                  <FaArrowLeft /> Previous
                </Link>
              )}

              {currentPage < totalPages && (
                <Link 
                  href={`/${categoryName}?page=${currentPage + 1}`}
                  className="flex items-center gap-2 px-6 py-3 bg-tv10-red text-white rounded-full font-bold hover:bg-red-700 transition shadow-lg"
                >
                  Next Page <FaArrowRight />
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-400">No news found.</h2>
            <Link href="/" className="text-tv10-red font-bold mt-4 inline-block hover:underline">
              Back to Home
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}