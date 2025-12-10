"use client";

import Link from "next/link";
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram, FaArrowUp, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

export default function Footer() {
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-16 pb-8 relative mt-0 border-t-4 border-tv10-gold">
      
      <div className="container mx-auto px-4">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* COLUMN 1: BRAND INFO */}
          <div>
            <div className="flex items-center gap-3 mb-6">
               <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/20">
                  <img src="/logo.png" alt="TV10" className="object-cover w-full h-full" />
               </div>
               <div>
                 <h2 className="text-2xl font-black text-white leading-none tracking-tighter">TV10 INDIA</h2>
                 <p className="text-[10px] text-tv10-gold font-bold uppercase tracking-widest">The Spiritual Voice</p>
               </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              TV10 India is Bharat's leading digital news platform dedicated to bringing you the truth from Uttar Pradesh, Uttarakhand, and the world of Dharma.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition duration-300">
                <FaFacebookF />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition duration-300">
                <FaTwitter />
              </a>
              <a href="https://www.youtube.com/@TV10India" target="_blank" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition duration-300">
                <FaYoutube />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition duration-300">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-tv10-red pl-3">News Categories</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/uttar-pradesh" className="hover:text-tv10-gold transition">Uttar Pradesh</Link></li>
              <li><Link href="/uttarakhand" className="hover:text-tv10-gold transition">Uttarakhand</Link></li>
              <li><Link href="/delhi" className="hover:text-tv10-gold transition">Delhi NCR</Link></li>
              <li><Link href="/dharma" className="hover:text-tv10-gold transition">Dharma & Sanskriti</Link></li>
              <li><Link href="/business" className="hover:text-tv10-gold transition">Business & Tech</Link></li>
              <li><Link href="/sports" className="hover:text-tv10-gold transition">Sports</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: USEFUL LINKS */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-tv10-red pl-3">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-tv10-gold transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-tv10-gold transition">Contact Support</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-tv10-gold transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-tv10-gold transition">Terms & Conditions</Link></li>
              <li><Link href="/advertise" className="hover:text-tv10-gold transition">Advertise with Us</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: CONTACT */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-tv10-red pl-3">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-tv10-red mt-1" />
                <span>Noida Sector 62, Uttar Pradesh,<br />India - 201309</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-tv10-red" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-tv10-red" />
                <span>editor@tv10india.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} TV10 India Media Pvt Ltd. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Designed with <span className="text-red-500">♥</span> for Bharat
          </p>
        </div>

      </div>

      {/* BACK TO TOP BUTTON */}
      <button 
        onClick={scrollToTop} 
        className="fixed bottom-6 right-6 bg-tv10-red text-white p-3 rounded-full shadow-2xl z-50 hover:bg-white hover:text-tv10-red transition-all duration-300 animate-bounce border-2 border-transparent hover:border-tv10-red"
        aria-label="Back to Top"
        title="Go to Top"
      >
        <FaArrowUp />
      </button>

    </footer>
  );
}