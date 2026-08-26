"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSearch, FaMoon, FaSun, FaBars, FaTimes, FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import LanguageToggle from "@/components/LanguageToggle";

export type Headline = { title: string; slug: string };
export interface HeaderProps {
  initialHeadlines?: Headline[];
}

const fallbackHeadline: Headline = {
  title: "Latest headlines coming soon",
  slug: "",
};

export default function Header({ initialHeadlines }: HeaderProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headlines, setHeadlines] = useState<Headline[]>(initialHeadlines || []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileSearchOpen(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' ||
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Latest headlines for the rolling breaking-news ticker
  useEffect(() => {
    fetch("/api/headlines", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { headlines?: Headline[] }) => {
        if (data.headlines && data.headlines.length > 0) {
          setHeadlines(data.headlines);
        }
      })
      .catch(() => {});
  }, []);

  const tickerHeadlines = headlines.length > 0 ? headlines : [fallbackHeadline];
  const scrollingHeadlines = [...tickerHeadlines, ...tickerHeadlines];

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const menuItems = ['HOME', 'UTTAR PRADESH', 'UTTARAKHAND', 'DELHI', 'NATIONAL', 'WORLD', 'DHARMA', 'BUSINESS', 'SPORTS', 'VIDEOS'];

  return (
    <header className="sticky top-0 z-50 shadow-2xl">

      {/* UTILITY BAR — date, social icons, login (DNA-style thin strip) */}
      <div className="hidden md:flex bg-tv10-gold text-tv10-metal text-xs font-semibold py-1.5 px-6 justify-between items-center border-b border-amber-600/40">
        <div className="text-tv10-metal font-bold tracking-wide">{today}</div>
        <div className="flex items-center gap-2.5 text-sm">
          <a href="#" aria-label="Facebook" className="hover:text-tv10-red transition"><FaFacebookF /></a>
          <a href="#" aria-label="Twitter" className="hover:text-tv10-red transition"><FaTwitter /></a>
          <a href="https://www.youtube.com/@TV10India" target="_blank" aria-label="YouTube" className="hover:text-tv10-red transition"><FaYoutube /></a>
          <a href="#" aria-label="Instagram" className="hover:text-tv10-red transition"><FaInstagram /></a>
        </div>
      </div>

      {/* BRAND BAR */}
      <div className="bg-white dark:bg-tv10-dark py-3 px-4 md:px-8 flex justify-between items-center shadow-sm relative z-20 border-b-2 border-tv10-gold">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="h-11 w-11 md:h-14 md:w-14 rounded-full overflow-hidden shrink-0 border-2 border-tv10-gold shadow-xl group-hover:shadow-2xl transition-shadow">
             <img src="/logo.png" alt="TV10 India" className="object-cover w-full h-full" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-4xl font-black tracking-tighter text-tv10-metal dark:text-white leading-none drop-shadow-sm">
              TV10 <span className="text-tv10-gold">INDIA</span>
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">
              Your Voice Your Choice
            </p>
          </div>
          <div className="md:hidden">
            <h1 className="text-2xl font-black tracking-tighter text-tv10-metal dark:text-white leading-none">
              TV10 <span className="text-tv10-gold">INDIA</span>
            </h1>
            <p className="text-[8px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.15em]">
              Your Voice Your Choice
            </p>
          </div>
        </Link>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 md:gap-3">

          <div className="scale-90 md:scale-100">
             <LanguageToggle />
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-tv10-gold transition-all">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm text-tv10-metal dark:text-white placeholder-gray-400 w-32 focus:w-48 transition-all font-medium"
            />
            <button type="submit" aria-label="Search">
              <FaSearch className="text-gray-400 hover:text-tv10-red transition" />
            </button>
          </form>

          {/* Mobile Search */}
          <button
            className="md:hidden p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-tv10-metal dark:text-white hover:bg-gray-200 transition shadow-sm shrink-0"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search"
          >
            <FaSearch className="text-sm" />
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-tv10-metal dark:text-white hover:bg-gray-200 transition shadow-sm shrink-0"
          >
            {darkMode ? <FaSun className="text-sm md:text-base" /> : <FaMoon className="text-sm md:text-base" />}
          </button>

          {/* Mobile Menu */}
          <button className="md:hidden text-2xl text-tv10-metal dark:text-white shrink-0 ml-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH DROPDOWN */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white dark:bg-tv10-dark px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 border border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm text-tv10-metal dark:text-white placeholder-gray-400 flex-1 font-medium"
              autoFocus
            />
            <button type="submit" aria-label="Search">
              <FaSearch className="text-gray-400" />
            </button>
          </form>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className={`bg-gradient-to-r from-gray-900 via-tv10-metal to-gray-900 text-white font-semibold text-sm ${menuOpen ? 'block' : 'hidden md:block'} border-t-4 border-tv10-red`}>
        <ul className="container mx-auto flex flex-col md:flex-row md:flex-wrap md:justify-center">
          {menuItems.map((item) => {
            const linkUrl = item === 'HOME' ? '/' : `/${item.toLowerCase().replace(/ /g, '-')}`;
            return (
              <li key={item}>
                <Link
                  href={linkUrl}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 md:px-4 hover:bg-tv10-red/90 transition-all uppercase tracking-wider text-center text-xs md:text-[12px] font-bold whitespace-nowrap"
                >
                  {item}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* BREAKING NEWS TICKER */}
      <div className="bg-tv10-gold text-tv10-metal text-xs font-bold py-1.5 px-4 flex items-center gap-3 border-b border-amber-600/40">
        <span className="shrink-0 bg-black/10 px-2 py-0.5 rounded uppercase tracking-wider">🔴 Latest</span>
        <div className="flex-1 overflow-hidden relative h-4">
          <div className="ticker-track">
            {scrollingHeadlines.map((headline, index) => {
              const content = <span className="ticker-item">🔴 {headline.title}</span>;
              if (!headline.slug) {
                return <span key={`${headline.title}-${index}`}>{content}</span>;
              }
              return (
                <Link key={`${headline.slug}-${index}`} href={`/news/${headline.slug}`} className="hover:underline">
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
