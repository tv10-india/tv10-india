import type { MetadataRoute } from "next";
import { client } from "@/sanityStudio/lib/sanity";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tv10-india.vercel.app").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, webStories] = await Promise.all([
    client.fetch(`*[_type == "post" && defined(slug.current)]{ "slug": slug.current, publishedAt, _updatedAt }`),
    client.fetch(`*[_type == "webStory"]{ _id, _updatedAt }`),
  ]);

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    ...["uttar-pradesh", "uttarakhand", "delhi", "national", "world", "dharma", "business", "sports", "videos"].map((category) => ({
      url: `${siteUrl}/${category}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...["about", "contact", "privacy-policy", "terms", "advertise"].map((page) => ({
      url: `${siteUrl}/${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...posts.map((post: { slug: string; publishedAt?: string; _updatedAt?: string }) => ({
      url: `${siteUrl}/news/${post.slug}`,
      lastModified: post._updatedAt || post.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...webStories.map((story: { _id: string; _updatedAt?: string }) => ({
      url: `${siteUrl}/web-stories/${story._id}`,
      lastModified: story._updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
