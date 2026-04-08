import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";

const footerLinks = [
  {
    title: "kw.com",
    links: ["Property Search", "KW® Agent Search", "Find a local KW® market center", "Blog"],
  },
  {
    title: "Company",
    links: ["Press", "Work at KW®", "Leadership", "Innovation Partners", "Worldwide", "Contact", "Open a Franchise"],
  },
  {
    title: "Search",
    links: ["Download App", "Luxury", "Commercial", "Land"],
  },
  {
    title: "KW® Agents",
    links: ["Join KW®", "Events", "KW Cares®", "KW Next Gen™", "Stories", "Shop", "Keller Home Loans"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-kw-footer text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-[13px] font-bold mb-6 text-gray-400 uppercase tracking-wider">{section.title}</h3>
              <ul className="flex flex-col gap-4">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-[13px] font-semibold hover:text-kw-red transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
          <Link to="#" className="hover:opacity-80 transition-opacity">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
              alt="App Store" 
              className="h-10"
              referrerPolicy="no-referrer"
            />
          </Link>
          <Link to="#" className="hover:opacity-80 transition-opacity">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
              alt="Google Play" 
              className="h-10"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col items-center gap-8">
          <div className="flex items-center gap-6">
            <Link to="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-gray-400">
            <Link to="#" className="hover:text-white">Terms of Use</Link>
            <Link to="#" className="hover:text-white">Privacy Policy</Link>
            <Link to="#" className="hover:text-white">Cookie Policy</Link>
            <Link to="#" className="hover:text-white">DMCA</Link>
            <Link to="#" className="hover:text-white">Fair Housing</Link>
            <Link to="#" className="hover:text-white">Accessibility</Link>
          </div>

          <div className="text-center text-[10px] text-gray-500 leading-relaxed max-w-2xl">
            <p>Keller Williams Realty, LLC, a franchise company, is an Equal Opportunity Employer and supports the Fair Housing Act.</p>
            <p>Each Keller Williams® office is independently owned and operated.</p>
            <p>Copyright © 1996-2026 Keller Williams Realty, LLC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
