import { client, urlFor } from "../../sanityStudio/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { FaSearch } from "react-icons/fa";

async function searchNews(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];
  const groqQuery = `
    *[
      _type == "post" &&
      (
        title match $searchTerm ||
        category match $searchTerm ||
        slug.current match $searchTerm ||
        select(
          category == "up" => "uttar pradesh",
          category == "uk" => "uttarakhand",
          category == "delhi" => "delhi",
          category == "national" => "national",
          category == "world" => "world",
          category == "dharma" => "dharma",
          category == "business" => "business",
          category == "sports" => "sports",
          category == "videos" => "videos",
          category == "mystery" => "mystery adbhut",
          category == "lifestyle" => "lifestyle",
          category == "web-stories" => "web stories",
          ""
        ) match $searchTerm
      )
    ] | order(publishedAt desc) [0...20] {
      title, slug, mainImage, publishedAt, category
    }
  `;
  return client.fetch(groqQuery, { searchTerm: `*${normalizedQuery}*` });
}

type Props = {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const results = await searchNews(query);

  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />

      <div className="container mx-auto px-4 py-10">

        <div className="flex flex-col items-center mb-10 border-b-4 border-tv10-red pb-4 max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase text-tv10-metal dark:text-white tracking-tighter mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Showing results for: <span className="font-bold text-tv10-red">&ldquo;{query}&rdquo;</span>
            </p>
          )}
        </div>

        {!query ? (
          <div className="text-center py-20">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400">Type something to search</h2>
            <p className="text-sm text-gray-500 mt-2">Search for news by title or category</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {results.map((story: any) => (
              <Link href={`/news/${story.slug.current}`} key={story.slug.current} className="group h-full max-w-md mx-auto w-full">
                <div className="bg-white dark:bg-tv10-metal rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
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
                  <div className="p-6 flex flex-col flex-1 items-center text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-tv10-gold mb-4 line-clamp-3">
                      {story.title}
                    </h3>
                    <div className="w-12 h-1 bg-tv10-gold rounded mb-4 opacity-50"></div>
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
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-400">No results found for &ldquo;{query}&rdquo;</h2>
            <Link href="/" className="text-tv10-red font-bold mt-4 inline-block hover:underline">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
