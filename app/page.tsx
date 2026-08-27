import { client } from "../sanityStudio/lib/sanity";
import Header, { Headline } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StateTabs from "@/components/StateTabs";
import WebStories from "@/components/WebStories";
import DharmaSection from "@/components/DharmaSection";
import VideoSection from "@/components/VideoSection";
import MysterySection from "@/components/MysterySection";
import CategoryNewsSection from "@/components/CategoryNewsSection";

// Updated Query to fetch @/components/MysterySectionicates
async function getData() {
  const query = `{
    "news": *[_type == "post"] | order(publishedAt desc) {
      _id,
      title, 
      slug, 
      category, 
      mainImage, 
      youtubeUrl, 
      publishedAt
    },
    "stories": *[_type == "webStory"] | order(_createdAt desc) [0...6] {
      _id, title, slides
    }
  }`;
  
  // Disable cache so you see new posts instantly
  return client.fetch(query, {}, { next: { revalidate: 0 } }); 
}

export default async function Home() {
  const { news, stories } = await getData();

  // Extract headlines for header ticker
  const headlines: Headline[] = (news || []).slice(0, 10).map((item: { title: string; slug?: { current?: string } }) => ({
    title: item.title,
    slug: item.slug?.current || "",
  }));

  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header initialHeadlines={headlines} />
      
      {/* 1. VISUAL STORIES */}
      <WebStories stories={stories} />

      {/* 2. HERO NEWS (Shows #1 Story Big + Next 4 on side) */}
      <HeroSection news={news} />

      {/* 3. STATE TABS (Filters the full latest-first feed for each region) */}
      <StateTabs news={news} />

      <DharmaSection news={news} />

      <CategoryNewsSection news={news} category="business" />

      <CategoryNewsSection news={news} category="sports" />

      <CategoryNewsSection news={news} category="world" />

      <VideoSection news={news} />

      <MysterySection news={news} />

    </main>
  );
}
