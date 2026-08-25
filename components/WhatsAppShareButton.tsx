"use client";

import { FaWhatsapp } from "react-icons/fa";

type Props = {
  title: string;
  slug: string;
};

export default function WhatsAppShareButton({ title, slug }: Props) {
  const handleShare = () => {
    const cleanSlug = slug?.trim();
    if (!cleanSlug) return;

    const articleUrl = `${window.location.origin}/news/${cleanSlug}`;
    const message = `${title}\n\n${articleUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="bg-[#25D366] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-green-600 transition"
      aria-label="Share this article on WhatsApp"
    >
      <FaWhatsapp className="text-sm" /> Share
    </button>
  );
}
