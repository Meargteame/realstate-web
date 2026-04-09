import Hero from "@/components/Hero";
import ExpertSection from "@/components/ExpertSection";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full flex flex-col flex-1 overflow-x-hidden bg-surface-container">
      <Hero />
      <ExpertSection />

      {/* Entrepreneurs Section */}
      <section className="relative h-[500px] md:h-[600px] w-full flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full text-white">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-medium mb-4">Where Entrepreneurs Thrive™</h2>
            <p className="text-lg mb-8 text-gray-200">Join a team of doers, dreamers, and entrepreneurs</p>
            <Button className="bg-[#111827] hover:bg-black border border-transparent hover:border-white/20 text-white rounded-full px-8 h-12 font-medium text-[14px]">
              Become a Keller Williams® Agent
            </Button>
          </div>
        </div>
      </section>

      {/* Informed Section */}
      <section className="py-24 px-6 w-full text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-medium mb-6 text-on-surface">Informed, empowered, successful.</h2>
          <p className="text-gray-600 mb-12 text-lg">Discover the perfect home loan solution with Keller Home Loans.</p>
          
          <div className="w-64 h-64 mx-auto rounded-t-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
              alt="Expert" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
