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
};

export type NewsPost = NewsItem & {
  styledTitle?: unknown[];
  gallery?: SanityImage[];
  body?: Array<{
    children?: Array<{
      text?: string;
    }>;
  }>;
};

export type WebStory = {
  _id: string;
  title: string;
  slides: SanityImage[];
};
