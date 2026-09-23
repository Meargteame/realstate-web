import React from "react";
import { Link } from "react-router-dom";
import { Home, Search, Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-4 py-16">
      <div className="text-center max-w-xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-[#b40101] text-white flex items-center justify-center font-serif text-2xl mx-auto rounded-sm shadow-sm">
            T
          </div>
          <div className="font-serif text-8xl sm:text-9xl text-stone-900 tracking-tighter font-normal select-none">
            404
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#b40101] font-semibold">
            Residence Not Located
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-stone-900">
            This Address Is Not in Our Registry
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            The page or private residence you are searching for has been moved, acquired, or is currently off-market.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#b40101] hover:bg-[#900101] rounded transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Flagship</span>
          </Link>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-stone-800 bg-white border border-stone-300 hover:border-stone-900 rounded transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Properties</span>
          </Link>
        </div>

        <div className="pt-8 border-t border-stone-200">
          <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-3">
            Recommended Portals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-600">
            <Link to="/properties" className="hover:text-[#b40101] transition-colors">Exclusive Residences</Link>
            <Link to="/agents" className="hover:text-[#b40101] transition-colors">Licensed Advisors</Link>
            <Link to="/mortgage-calculator" className="hover:text-[#b40101] transition-colors">Financing Advisory</Link>
            <Link to="/home-value" className="hover:text-[#b40101] transition-colors">Property Valuation</Link>
            <Link to="/blog" className="hover:text-[#b40101] transition-colors">The Torra Journal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
