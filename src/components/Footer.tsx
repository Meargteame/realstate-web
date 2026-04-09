import { Link } from "react-router-dom";
import { ArrowRight, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 px-8 flex-shrink-0">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-white/10 pb-16">
          {/* Logo & Address */}
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-6">ESTATE</h2>
            <div className="text-[11px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest">
              <p>Global Headquarters</p>
              <p>One Financial Center, Suite 4500</p>
              <p>Singapore 018961</p>
            </div>
            <div className="flex gap-3 mt-8">
              <Link to="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-3.5 h-3.5 text-gray-300" />
              </Link>
              <Link to="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-3.5 h-3.5 text-gray-300" />
              </Link>
              <Link to="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-3.5 h-3.5 text-gray-300" />
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-[12px] font-bold mb-6 text-white uppercase tracking-[0.15em]">Company</h3>
            <ul className="flex flex-col gap-4">
              <li><Link to="#" className="text-[12px] text-gray-400 hover:text-white uppercase tracking-widest font-semibold transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-[12px] text-gray-400 hover:text-white uppercase tracking-widest font-semibold transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="text-[12px] text-gray-400 hover:text-white uppercase tracking-widest font-semibold transition-colors">Cookie Settings</Link></li>
            </ul>
          </div>

          {/* Exclusives */}
          <div>
            <h3 className="text-[12px] font-bold mb-6 text-white uppercase tracking-[0.15em]">Exclusives</h3>
            <ul className="flex flex-col gap-4">
              <li><Link to="#" className="text-[12px] text-gray-400 hover:text-white uppercase tracking-widest font-semibold transition-colors">Architectural Standards</Link></li>
              <li><Link to="#" className="text-[12px] text-gray-400 hover:text-white uppercase tracking-widest font-semibold transition-colors">Partner Program</Link></li>
              <li><Link to="#" className="text-[12px] text-gray-400 hover:text-white uppercase tracking-widest font-semibold transition-colors">Concierge</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[12px] font-bold mb-6 text-white uppercase tracking-[0.15em]">Newsletter</h3>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest mb-6">Subscribe to curated insights</p>
            <div className="relative border-b border-gray-600 pb-2 flex items-center">
              <input 
                type="email" 
                placeholder="YOUR EMAIL.COM" 
                className="bg-transparent border-none outline-none text-[12px] text-white w-full uppercase placeholder:text-gray-600 tracking-widest"
              />
              <button className="text-white hover:text-gray-300 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <p>© 2026 ESTATE RESERVE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
