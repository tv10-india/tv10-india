import { client } from "@/lib/sanity";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StateTabs from "@/components/StateTabs";
import WebStories from "@/components/WebStories";
import Footer from "@/components/Footer"; 
import DharmaSection from "@/components/DharmaSection";
import VideoSection from "@/components/VideoSection";
import MysterySection from "@/components/MysterySection";

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

  // LOGIC TO PREVENT DUPLICATES
  // 1. Identify the Main Story (The one big on top)
  const mainStoryId = news[0]?._id;

  // 2. Create a "Clean List" for the bottom sections
  // This removes the Main Story from the State Tabs so it doesn't repeat
  const newsWithoutHero = news.filter((item: any) => item._id !== mainStoryId);

  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />
      
      {/* 1. VISUAL STORIES */}
      <WebStories stories={stories} />

      {/* 2. HERO NEWS (Shows #1 Story Big + Next 4 on side) */}
      <HeroSection news={news} />

      {/* 3. STATE TABS (Uses the clean list, so #1 story won't repeat here) */}
      <StateTabs news={newsWithoutHero} />

      <DharmaSection news={news} />

      <VideoSection news={news} />

      <MysterySection news={news} />

    </main>
  );
}