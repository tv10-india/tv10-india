"use client";

import { FaFacebookF, FaLinkedinIn, FaShareNodes, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

type Props = {
  title: string;
  slug: string;
};

export default function WhatsAppShareButton({ title, slug }: Props) {
  const getArticleUrl = () => {
    const cleanSlug = slug?.trim();
    return cleanSlug ? `${window.location.origin}/news/${cleanSlug}` : "";
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleWhatsAppShare = () => {
    const articleUrl = getArticleUrl();
    if (!articleUrl) return;

    const message = `${title}\n\n${articleUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    openShareWindow(whatsappUrl);
  };

  const handleFacebookShare = () => {
    const articleUrl = getArticleUrl();
    if (articleUrl) openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`);
  };

  const handleXShare = () => {
    const articleUrl = getArticleUrl();
    if (articleUrl) openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(articleUrl)}`);
  };

  const handleLinkedInShare = () => {
    const articleUrl = getArticleUrl();
    if (articleUrl) openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`);
  };

  const handleNativeShare = async () => {
    const articleUrl = getArticleUrl();
    if (!articleUrl) return;

    if (navigator.share) {
      await navigator.share({ title, url: articleUrl });
    } else {
      await navigator.clipboard.writeText(articleUrl);
    }
  };

  return (
    <div className="flex items-center gap-1.5" aria-label="Share this article">
      <button type="button" onClick={handleWhatsAppShare} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-green-600" aria-label="Share on WhatsApp" title="Share on WhatsApp">
        <FaWhatsapp />
      </button>
      <button type="button" onClick={handleFacebookShare} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:bg-[#166FE5]" aria-label="Share on Facebook" title="Share on Facebook">
        <FaFacebookF />
      </button>
      <button type="button" onClick={handleXShare} className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition hover:bg-gray-800" aria-label="Share on X" title="Share on X">
        <FaXTwitter />
      </button>
      <button type="button" onClick={handleLinkedInShare} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A66C2] text-white transition hover:bg-[#004182]" aria-label="Share on LinkedIn" title="Share on LinkedIn">
        <FaLinkedinIn />
      </button>
      <button type="button" onClick={handleNativeShare} className="flex h-8 w-8 items-center justify-center rounded-full bg-tv10-red text-white transition hover:bg-red-700" aria-label="More sharing options" title="More sharing options">
        <FaShareNodes />
      </button>
    </div>
  );
}
