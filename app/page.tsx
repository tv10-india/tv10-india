import { client } from "../sanityStudio/lib/sanity";
import Header, { Headline } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StateTabs from "@/components/StateTabs";
import WebStories from "@/components/WebStories";
import DharmaSection from "@/components/DharmaSection";
import VideoSection from "@/components/VideoSection";
import MysterySection from "@/components/MysterySection";
import CategoryNewsSection from "@/components/CategoryNewsSection";
<<<<<<< HEAD
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
=======
import AdSlot from "@/components/AdSlot";
import { LIVE_POST_FILTER, LIVE_POST_ORDER, POST_CARD_PROJECTION } from "@/lib/posts";
import type { NewsItem, WebStory, YouTubeVideo } from "../types/content";

const youtubeChannelUrl = "https://www.youtube.com/@TV10India";

async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  try {
    const channelResponse = await fetch(youtubeChannelUrl, {
      next: { revalidate: 900 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!channelResponse.ok) return [];

    const channelHtml = await channelResponse.text();
    const channelId = channelHtml.match(/(?:channelId|externalId)":"(UC[^"]+)/)?.[1];
    if (!channelId) return [];

    const feedResponse = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      next: { revalidate: 900 },
    });
    if (!feedResponse.ok) return [];

    const feed = await feedResponse.text();
    return [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 4).map((match) => {
      const entry = match[1];
      const id = entry.match(/<yt:videoId>([^<]+)</)?.[1];
      const title = entry.match(/<title>([^<]+)</)?.[1];
      const publishedAt = entry.match(/<published>([^<]+)</)?.[1];
      if (!id || !title || !publishedAt) return null;

      return {
        id,
        title,
        publishedAt,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        channelUrl: youtubeChannelUrl,
      };
    }).filter((video): video is YouTubeVideo => video !== null);
  } catch {
    return [];
  }
}

async function getData() {
  const query = `{
    "news": *[${LIVE_POST_FILTER}] | ${LIVE_POST_ORDER} {
      ${POST_CARD_PROJECTION}
>>>>>>> 176d453 (Update V1.5)
    },
    "stories": *[_type == "webStory"] | order(_createdAt desc) [0...6] {
      _id, title, slides
    },
<<<<<<< HEAD
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
=======
    "dharma": *[${LIVE_POST_FILTER} && category == "dharma"] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "business": *[${LIVE_POST_FILTER} && category == "business"] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "sports": *[${LIVE_POST_FILTER} && category == "sports"] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "world": *[${LIVE_POST_FILTER} && category == "world"] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "lifestyle": *[${LIVE_POST_FILTER} && category == "lifestyle"] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "entertainment": *[${LIVE_POST_FILTER} && category == "entertainment"] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "webStories": *[${LIVE_POST_FILTER} && category == "web-stories"] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "videos": *[${LIVE_POST_FILTER} && defined(youtubeUrl)] | ${LIVE_POST_ORDER} [0...4] {
      ${POST_CARD_PROJECTION}
    },
    "mystery": *[${LIVE_POST_FILTER} && category == "mystery"] | ${LIVE_POST_ORDER} [0...3] {
      ${POST_CARD_PROJECTION}
    },
    "stateUp": *[${LIVE_POST_FILTER} && category == "up"] | ${LIVE_POST_ORDER} [0...8] {
      ${POST_CARD_PROJECTION}
    },
    "stateUk": *[${LIVE_POST_FILTER} && category == "uk"] | ${LIVE_POST_ORDER} [0...8] {
      ${POST_CARD_PROJECTION}
    },
    "stateDelhi": *[${LIVE_POST_FILTER} && category == "delhi"] | ${LIVE_POST_ORDER} [0...8] {
      ${POST_CARD_PROJECTION}
    },
    "stateNational": *[${LIVE_POST_FILTER} && category in ["up", "uk", "delhi", "national"]] | ${LIVE_POST_ORDER} [0...8] {
      ${POST_CARD_PROJECTION}
>>>>>>> 176d453 (Update V1.5)
    }
  }`;

  return client.fetch<{
    news: NewsItem[];
    stories: WebStory[];
    dharma: NewsItem[];
    business: NewsItem[];
    sports: NewsItem[];
    world: NewsItem[];
<<<<<<< HEAD
    videos: NewsItem[];
    mystery: NewsItem[];
=======
    lifestyle: NewsItem[];
    entertainment: NewsItem[];
    webStories: NewsItem[];
    videos: NewsItem[];
    mystery: NewsItem[];
    stateUp: NewsItem[];
    stateUk: NewsItem[];
    stateDelhi: NewsItem[];
    stateNational: NewsItem[];
>>>>>>> 176d453 (Update V1.5)
  }>(query, {}, { next: { revalidate: 60 } });
}

export default async function Home() {
<<<<<<< HEAD
  const { news, stories, dharma, business, sports, world, videos, mystery } = await getData();
=======
  const [{ news, stories, dharma, business, sports, world, lifestyle, entertainment, webStories, videos, mystery, stateUp, stateUk, stateDelhi, stateNational }, youtubeVideos] = await Promise.all([
    getData(),
    getYouTubeVideos(),
  ]);
>>>>>>> 176d453 (Update V1.5)

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

<<<<<<< HEAD
      {/* 3. STATE TABS (Filters the full latest-first feed for each region) */}
      <StateTabs news={news} />

      <DharmaSection news={dharma} />

      <CategoryNewsSection news={business} category="business" />

      <CategoryNewsSection news={sports} category="sports" />

      <CategoryNewsSection news={world} category="world" />

      <VideoSection news={videos} />

      <MysterySection news={mystery} />
=======
      {/* Direct bookings take precedence; the "all" AdSense unit fills these
          three when none is running. AdBanner removes itself when AdSense
          reports the slot unfilled, so an unsold placement still collapses
          rather than leaving a gap in the page. */}
      <div className="container mx-auto px-4">
        <AdSlot slot="hero-below" adUnit="all" />
      </div>

      {/* 3. STATE TABS (Each tab backed by its own dedicated query) */}
      <StateTabs newsByState={{ up: stateUp, uk: stateUk, delhi: stateDelhi, national: stateNational, world }} />

      <DharmaSection news={dharma} />

      <CategoryNewsSection news={business} category="business" />

      <CategoryNewsSection news={sports} category="sports" />

      <div className="container mx-auto px-4">
        <AdSlot slot="feed-inline" adUnit="all" />
      </div>

      <CategoryNewsSection news={world} category="world" />

      <CategoryNewsSection news={lifestyle} category="lifestyle" />

      <CategoryNewsSection news={entertainment} category="entertainment" />

      <CategoryNewsSection news={webStories} category="web-stories" />

      <VideoSection news={videos} youtubeVideos={youtubeVideos} />

      <MysterySection news={mystery} />

      <div className="container mx-auto px-4">
        <AdSlot slot="footer" adUnit="all" />
      </div>
>>>>>>> 176d453 (Update V1.5)

    </main>
  );
}
