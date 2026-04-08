import { Card, CardContent } from "@/components/ui/card";
import { Play, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const posts = [
  {
    title: "The Housing Market Is Changing Again — Here's Why | Real Estate Market Update (February 2026)",
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "FEBRUARY 2026",
  },
  {
    title: "Should You Buy a Home Right Now? | Real Estate Market Update (January 2026)",
    image: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "JANUARY 2026",
  },
  {
    title: "Housing Market Forecast 2026 | Keller Williams Real Estate Market Update (December 2025)",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "DECEMBER 2025",
  },
];

export default function ExpertSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Take it From Our Experts</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Explore our blog posts to learn from the best about buying selling and maintaining your home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <Card key={i} className="border-none shadow-none group cursor-pointer">
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-kw-red text-white text-[10px] font-bold px-3 py-1 rounded-sm">
                  {post.date}
                </div>
              </div>
              <CardContent className="p-0">
                <h3 className="text-[17px] font-bold leading-snug mb-4 group-hover:text-kw-red transition-colors">
                  {post.title}
                </h3>
                <Link to="#" className="inline-flex items-center text-[13px] font-bold hover:text-kw-red transition-colors">
                  Read More <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
