import { Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpertSection() {
  const videos = [
    { title: "Gary Keller on 2026 Market Outlook, Fed Signals...", bg: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80" },
    { title: "Should You Buy a Home Right Now? | Update (Jan 2026)", bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
    { title: "Housing Market Forecast 2026 | Real Estate Update", bg: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" }
  ];

  const articles = [
    { title: "Part One: Your First-Time Homebuyer's Guide", readTime: "4 Minutes", bg: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
    { title: "Part Two: Your First-Time Homebuyer's Guide", readTime: "4 Minutes", bg: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" },
    { title: "Part Three: Your First-Time Homebuyer's Guide", readTime: "4 Minutes", bg: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" }
  ];

  return (
    <section className="py-24 px-6 max-w-[1400px] mx-auto w-full bg-surface-container">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-medium text-on-surface mb-4">Take it From Our Experts</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Explore our blog posts to learn from the best about buying selling and maintaining your home</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {videos.map((vid, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
            <div className="h-48 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${vid.bg}")` }} />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center text-white relative z-10 bg-black/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <h3 className="font-semibold text-gray-900 leading-snug mb-6">{vid.title}</h3>
              <span className="text-primary text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Read More &rsaquo;</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {articles.map((art, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
            <div className="h-40 relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${art.bg}")` }} />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 leading-snug mb-3">{art.title}</h3>
                <p className="text-xs text-gray-500 font-medium mb-6">Read Time: {art.readTime}</p>
              </div>
              <span className="text-primary text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Read More &rsaquo;</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="#" className="text-gray-600 font-semibold hover:text-black transition-colors">
          Explore More Articles
        </Link>
      </div>
    </section>
  );
}
