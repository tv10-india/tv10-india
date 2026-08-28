import { client } from "../sanityStudio/lib/sanity";
import Header, { Headline } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StateTabs from "@/components/StateTabs";
import WebStories from "@/components/WebStories";
import DharmaSection from "@/components/DharmaSection";
import VideoSection from "@/components/VideoSection";
import MysterySection from "@/components/MysterySection";
import CategoryNewsSection from "@/components/CategoryNewsSection";
import type { NewsItem, WebStory } from "../types/content";

async function getData() {
  const query = `{
    "news": *[_type == "post"] | order(publishedAt desc) [0...50] {
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
    },
    "dharma": *[_type == "post" && category == "dharma"] | order(publishedAt desc) [0...4] {
      _id, title, slug, category, mainImage, youtubeUrl, publishedAt
    },
    "business": *[_type == "post" && category == "business"] | order(publishedAt desc) [0...4] {
      _id, title, slug, category, mainImage, youtubeUrl, publishedAt
    },
    "sports": *[_type == "post" && category == "sports"] | order(publishedAt desc) [0...4] {
      _id, title, slug, category, mainImage, youtubeUrl, publishedAt
    },
    "world": *[_type == "post" && category == "world"] | order(publishedAt desc) [0...4] {
      _id, title, slug, category, mainImage, youtubeUrl, publishedAt
    },
    "videos": *[_type == "post" && defined(youtubeUrl)] | order(publishedAt desc) [0...4] {
      _id, title, slug, category, mainImage, youtubeUrl, publishedAt
    },
    "mystery": *[_type == "post" && category == "mystery"] | order(publishedAt desc) [0...3] {
      _id, title, slug, category, mainImage, youtubeUrl, publishedAt
    }
  }`;

  return client.fetch<{
    news: NewsItem[];
    stories: WebStory[];
    dharma: NewsItem[];
    business: NewsItem[];
    sports: NewsItem[];
    world: NewsItem[];
    videos: NewsItem[];
    mystery: NewsItem[];
  }>(query, {}, { next: { revalidate: 60 } });
}

export default async function Home() {
  const { news, stories, dharma, business, sports, world, videos, mystery } = await getData();

  // Extract headlines for header ticker
  const headlines: Headline[] = (news || []).slice(0, 10).map((item: NewsItem) => ({
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

      <DharmaSection news={dharma} />

      <CategoryNewsSection news={business} category="business" />

      <CategoryNewsSection news={sports} category="sports" />

      <CategoryNewsSection news={world} category="world" />

      <VideoSection news={videos} />

      <MysterySection news={mystery} />

    </main>
  );
}
