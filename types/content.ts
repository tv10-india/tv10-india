export type SanityImage = {
  asset?: {
    _ref?: string;
    _type?: string;
  };
  _ref?: string;
  _type?: string;
  crop?: unknown;
  hotspot?: unknown;
  caption?: string;
};

<<<<<<< HEAD
=======
export type Author = {
  _id?: string;
  name: string;
  slug?: {
    current?: string;
  };
  designation?: string;
  photo?: SanityImage;
  bio?: string;
  socialLinks?: string[];
};

>>>>>>> 176d453 (Update V1.5)
export type NewsItem = {
  _id?: string;
  title: string;
  slug: {
    current: string;
  };
  category?: string;
  mainImage?: SanityImage;
  youtubeUrl?: string;
  publishedAt: string;
<<<<<<< HEAD
=======
  isBreaking?: boolean;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelUrl: string;
};

/** One Portable Text block from an article body. */
export type BodyBlock = {
  _type?: string;
  style?: string;
  /** Set on list items, absent on ordinary paragraphs. */
  listItem?: string;
  children?: Array<{
    text?: string;
  }>;
>>>>>>> 176d453 (Update V1.5)
};

export type NewsPost = NewsItem & {
  styledTitle?: unknown[];
  gallery?: SanityImage[];
<<<<<<< HEAD
  body?: Array<{
    children?: Array<{
      text?: string;
    }>;
  }>;
=======
  author?: Author;
  body?: BodyBlock[];
>>>>>>> 176d453 (Update V1.5)
};

export type WebStory = {
  _id: string;
  title: string;
  slides: SanityImage[];
};
