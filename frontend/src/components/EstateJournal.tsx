import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function EstateJournal() {
  return (
    <section className="py-20 px-6 max-w-[1400px] mx-auto w-full bg-surface-container">
      <div className="text-center mb-16">
        <p className="text-[11px] font-bold tracking-wider text-primary uppercase mb-3">Education & Insights</p>
        <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight">The Estate Journal</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[600px]">
        {/* Left Large Card */}
        <div className="relative rounded-2xl overflow-hidden group h-[500px] lg:h-full">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1545622783-b3e0214ef4f3?auto=format&fit=crop&w=1200&q=80")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 flex flex-col items-start w-full">
            <span className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider mb-4 rounded-sm">Masterclass</span>
            <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4 max-w-sm drop-shadow-xl">Architecture as an Asset Class.</h3>
            <p className="text-gray-300 text-sm mb-6 max-w-sm leading-relaxed">How Pritzker Prize-winning designs add tangible long-term value to luxury portfolios.</p>
            <Link to="#" className="text-white text-[13px] font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all">
              Read Article <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 h-full">
          {/* Top Half Card */}
          <div className="relative rounded-2xl overflow-hidden group h-[280px] lg:h-1/2">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1621501103258-3eaf2ba0cff0?auto=format&fit=crop&w=1000&q=80")' }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider mb-3 w-max rounded-sm">Investment</span>
              <h3 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-4 drop-shadow-lg max-w-md">The Future of <br/>Tokenized Estates</h3>
              <Link to="#" className="text-white text-[12px] font-bold flex items-center gap-2 hover:underline decoration-white/50 underline-offset-4">
                Discover More <ArrowRight className="w-3.5 h-3.5 rotate-[-45deg]" />
              </Link>
            </div>
            <div className="absolute bottom-6 right-8 text-white/20 text-4xl font-black uppercase tracking-widest pointer-events-none">
              Digital Wealth
            </div>
          </div>

          {/* Bottom Half Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-[280px] lg:h-1/2">
            {/* Red Card */}
            <div className="bg-primary rounded-2xl p-8 flex flex-col justify-between text-white shadow-xl">
              <div>
                <ShieldCheck className="w-8 h-8 mb-5" />
                <h3 className="text-xl font-bold leading-tight mb-3">Privacy Standards in the Digital Age</h3>
                <p className="text-xs text-white/80 leading-relaxed font-medium">How we protect high-net-worth identity throughout the transaction process.</p>
              </div>
              <Link to="#" className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-white/90 hover:text-white mt-4">
                Guide <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* White Card */}
            <div className="bg-white rounded-2xl p-8 flex flex-col justify-between shadow-sm border border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 block">Expert View</span>
                <h3 className="text-xl font-bold leading-tight text-on-surface mb-3">Sustainability & <br/>Longevity</h3>
                <p className="text-xs text-gray-500 leading-relaxed">The shift towards carbon-neutral luxury and what it implies for the next generation of owners.</p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover"/>
                </div>
                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Clara Vance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
