"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaSearch, FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import LanguageToggle from "@/components/LanguageToggle"; // Ensure this is imported

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Date Logic
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Dark Mode Logic
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

  const menuItems = ['HOME', 'UTTAR PRADESH', 'UTTARAKHAND', 'DELHI', 'DHARMA', 'BUSINESS', 'SPORTS', 'VIDEOS'];

  return (
    <header className="sticky top-0 z-50 shadow-xl">
      
      {/* 1. TOP BAR (Date & Ticker) */}
      <div className="bg-tv10-metal text-white text-xs font-bold py-1 px-4 flex justify-between items-center border-b border-gray-600">
        <div className="hidden md:block opacity-80">{today}</div>
        <div className="flex-1 mx-4 overflow-hidden relative group">
           <div className="whitespace-nowrap animate-ticker inline-block text-tv10-gold">
              🔴 BREAKING: Welcome to the new TV10 India Digital Platform...
           </div>
        </div>
      </div>

      {/* 2. MAIN BRAND BAR (GOLD BACKGROUND) */}
      <div className="bg-tv10-gold py-3 px-4 md:px-8 flex justify-between items-center shadow-md relative z-20">
        
        {/* LOGO AREA */}
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          {/* Logo Container */}
          <div className="h-10 w-10 md:h-14 md:w-14 rounded-full overflow-hidden shrink-0">
             <img src="/logo.png" alt="TV10" className="object-cover w-full h-full" />
          </div>
          
          {/* Text Logo */}
          <div className="hidden md:block">
            <h1 className="text-4xl font-black tracking-tighter text-black leading-none drop-shadow-sm">
              TV10 <span className="text-white text-stroke">INDIA</span>
            </h1>
            <p className="text-[10px] text-tv10-metal font-bold uppercase tracking-widest">
              The Spiritual Voice of Bharat
            </p>
          </div>
          {/* Mobile Text Logo (Smaller) */}
          <div className="md:hidden">
            <h1 className="text-2xl font-black tracking-tighter text-black leading-none">
              TV10 INDIA
            </h1>
          </div>
        </Link>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* 1. LANGUAGE SWITCHER (Now visible on Mobile) */}
          {/* Scaled down slightly (90%) on mobile to save space */}
          <div className="scale-90 md:scale-100">
             <LanguageToggle />
          </div>

          {/* Search Bar (Hidden on Mobile) */}
          <div className="hidden md:flex items-center bg-white/30 backdrop-blur-md rounded-full px-4 py-2 border border-black/10 shadow-inner">
            <input 
              type="text" 
              placeholder="Search news..." 
              className="bg-transparent outline-none text-sm text-black placeholder-black/60 w-32 focus:w-48 transition-all font-semibold"
            />
            <FaSearch className="text-black/60" />
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-white text-tv10-metal hover:bg-black hover:text-tv10-gold transition shadow-lg shrink-0"
          >
            {darkMode ? <FaSun className="text-sm md:text-base" /> : <FaMoon className="text-sm md:text-base" />}
          </button>

          {/* Mobile Menu Icon */}
          <button className="md:hidden text-2xl text-black shrink-0 ml-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* 3. NAVIGATION MENU */}
      <nav className={`bg-tv10-metal text-white font-semibold text-sm ${menuOpen ? 'block' : 'hidden md:block'} border-t-4 border-tv10-red`}>
        <ul className="container mx-auto flex flex-col md:flex-row md:justify-center">
          {menuItems.map((item) => {
            const linkUrl = item === 'HOME' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
            return (
              <li key={item}>
                <Link 
                  href={linkUrl} 
                  onClick={() => setMenuOpen(false)} // Close menu on click
                  className="block py-3 px-6 hover:bg-tv10-red transition-colors uppercase tracking-wide text-center"
                >
                  {item}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}