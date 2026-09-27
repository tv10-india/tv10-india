export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.tv10india.com"
).replace(/\/$/, "");

export const SITE_NAME = "TV10 India";

export const SITE_LOGO = `${SITE_URL}/logo.png`;

export const SITE_DESCRIPTION =
  "TV10 India delivers the latest news from Uttar Pradesh, Uttarakhand, Delhi NCR and across India, covering politics, business, sports and more.";

export const SITE_SOCIALS = [
  "https://www.youtube.com/@TV10India",
  "https://www.instagram.com/tv10.india/",
  "https://www.threads.net/@tv10.india",
  "https://www.linkedin.com/company/tv10-india-official/",
];
