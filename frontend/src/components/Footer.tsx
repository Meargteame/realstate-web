import { Link } from "react-router-dom";
import { ArrowRight, Twitter, Instagram, Linkedin, Phone, MapPin } from "lucide-react";
import TorraLogo from "./TorraLogo";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 px-8 flex-shrink-0">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 border-b border-white/10 pb-20">
          {/* Logo & Address */}
          <div>
            <div className="mb-6">
              <TorraLogo size={48} color="#b40101" compact showText />
            </div>
            <div className="text-[12px] text-gray-400 font-medium leading-relaxed uppercase tracking-wider mb-6">
              <p className="mb-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Office</p>
              <p className="mb-1">7945 FM 2757</p>
              <p className="mb-1">Forney, TX 75126</p>
              <p className="mt-3 flex items-center gap-2"><Phone className="w-3 h-3" /> (469) 345-6868</p>
              <p className="mt-1 text-gray-500">Brokerage ID: 0751886</p>
            </div>
            <div className="flex gap-4">
              <Link 
                to="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:scale-110 transition-all duration-300"
              >
                <Twitter className="w-4 h-4 text-gray-300" />
              </Link>
              <Link 
                to="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:scale-110 transition-all duration-300"
              >
                <Instagram className="w-4 h-4 text-gray-300" />
              </Link>
              <Link 
                to="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red hover:scale-110 transition-all duration-300"
              >
                <Linkedin className="w-4 h-4 text-gray-300" />
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-[13px] font-black mb-8 text-white uppercase tracking-[0.15em]">Explore</h3>
            <ul className="flex flex-col gap-5">
              <li>
                <Link 
                  to="/properties" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Property Search
                </Link>
              </li>
              <li>
                <Link 
                  to="/agents" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Find an Agent
                </Link>
              </li>
              <li>
                <Link 
                  to="/open-houses" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Open Houses
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Real Estate Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-[13px] font-black mb-8 text-white uppercase tracking-[0.15em]">Tools</h3>
            <ul className="flex flex-col gap-5">
              <li>
                <Link 
                  to="/mortgage-calculator" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link 
                  to="/home-value" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Home Value Estimator
                </Link>
              </li>
              <li>
                <Link 
                  to="/affordability-calculator" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Affordability Calculator
                </Link>
              </li>
              <li>
                <Link 
                  to="/become-agent" 
                  className="text-[13px] text-gray-400 hover:text-brand-red uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  Become an Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[13px] font-black mb-8 text-white uppercase tracking-[0.15em]">Newsletter</h3>
            <p className="text-[12px] text-gray-400 font-medium uppercase tracking-wider mb-8 leading-relaxed">
              Subscribe to curated insights and exclusive listings
            </p>
            <div className="relative border-b-2 border-gray-600 pb-3 flex items-center hover:border-brand-red transition-colors duration-300 group">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="bg-transparent border-none outline-none text-[13px] text-white w-full uppercase placeholder:text-gray-600 tracking-wider font-semibold"
              />
              <button className="text-gray-400 group-hover:text-brand-red transition-colors duration-300">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-gray-500 uppercase tracking-wider font-bold">
          <p>© 2026 TORRA COMMERCIAL REAL ESTATE GROUP. ALL RIGHTS RESERVED.</p>
          <p className="text-gray-600">BROKERAGE ID: 0751886</p>
        </div>
      </div>
    </footer>
  );
}
