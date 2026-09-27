<<<<<<< HEAD
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
=======
import type { MetadataRoute } from "next";
import { client } from "@/sanityStudio/lib/sanity";
import { SITE_URL } from "@/lib/site";
import { LIVE_POST_FILTER } from "@/lib/posts";
import { CATEGORY_SLUG_TO_CODE } from "@/lib/categories";

const siteUrl = SITE_URL;

// Without this the sitemap is prerendered once at build time, so articles
// published after a deploy never appear in it until the next one. Hourly is
// enough here — fresh articles are carried by /news-sitemap.xml.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, webStories, authors] = await Promise.all([
    client.fetch(`*[${LIVE_POST_FILTER} && defined(slug.current)]{ "slug": slug.current, publishedAt, _updatedAt }`),
    client.fetch(`*[_type == "webStory"]{ _id, _updatedAt }`),
    // Only staff who still have at least one live story. An author page with no
    // articles on it is a thin page, and submitting thin pages is a good way to
    // spend crawl budget on nothing.
    client.fetch(
      `*[_type == "author" && isActive != false && defined(slug.current)
        && count(*[${LIVE_POST_FILTER} && author._ref == ^._id]) > 0]{ "slug": slug.current, _updatedAt }`,
    ),
  ]);

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    ...Object.keys(CATEGORY_SLUG_TO_CODE).map((category) => ({
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
    ...authors.map((author: { slug: string; _updatedAt?: string }) => ({
      url: `${siteUrl}/author/${author.slug}`,
      lastModified: author._updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
>>>>>>> 176d453 (Update V1.5)
