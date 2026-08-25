import { client } from "../../../sanityStudio/lib/sanity";
import StoryViewer from "@/components/StoryViewer";

async function getStory(id: string) {
  const query = `*[_type == "webStory" && _id == $id][0]`;
  return client.fetch(query, { id });
}

async function getAllStoryIds() {
  const query = `*[_type == "webStory"] | order(_createdAt desc)._id`;
  return client.fetch(query);
}

type Props = {
  params: Promise<{ id: string }>;
}

export default async function WebStoryPage({ params }: Props) {
  const resolvedParams = await params;
  const [story, allIds] = await Promise.all([
    getStory(resolvedParams.id),
    getAllStoryIds(),
  ]);

  if (!story) return <div className="text-white text-center pt-20 bg-black min-h-screen">Story not found</div>;

  const currentIndex = allIds.indexOf(resolvedParams.id);
  const nextStoryId = currentIndex > -1 && currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : null;
  const prevStoryId = currentIndex > 0 ? allIds[currentIndex - 1] : null;

  return <StoryViewer story={story} nextStoryId={nextStoryId} prevStoryId={prevStoryId} />;
}
