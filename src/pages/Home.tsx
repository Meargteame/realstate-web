import Hero from "@/components/Hero";
import ExpertSection from "@/components/ExpertSection";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="w-full flex flex-col flex-1 overflow-x-hidden">
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
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white flex flex-col items-center text-center md:text-left md:items-start md:block">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Where Entrepreneurs Thrive™</h2>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-gray-200">Join a team of doers, dreamers, and entrepreneurs</p>
            <Button className="bg-kw-footer hover:bg-kw-dark text-white rounded-full px-8 h-12 font-bold text-[13px] w-full sm:w-auto">
              Become a Keller Williams® Agent
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Informed Section */}
      <section className="py-16 md:py-24 px-6 bg-kw-gray w-full flex-shrink-0">
        <div className="max-w-7xl mx-auto text-center w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Informed, empowered, successful.</h2>
          <p className="text-gray-600 mb-8 md:mb-12 text-md md:text-lg">Discover the perfect home loan solution with Keller Home Loans.</p>
          
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Expert" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mb-8">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Keller_Williams_Realty_logo.svg/2560px-Keller_Williams_Realty_logo.svg.png" 
                alt="KW Home Loans" 
                className="h-12 object-contain grayscale brightness-0"
                referrerPolicy="no-referrer"
              />
              <p className="text-kw-red font-bold text-xl mt-2">Home Loans</p>
            </div>
            <p className="text-gray-600 max-w-2xl mb-10 leading-relaxed">
              Helping buyers stand out in competitive housing markets by providing faster loan approval and stronger purchase offer.
            </p>
            <Button variant="outline" className="border-kw-dark text-kw-dark hover:bg-kw-dark hover:text-white rounded-full px-10 h-12 font-bold text-[13px]">
              Read More
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center md:justify-end overflow-hidden flex-shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-md text-center md:text-right text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Curious about what’s trending in your neighborhood?</h2>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-gray-200">Download our app for real estate insights, on demand.</p>
            <Button className="bg-kw-footer hover:bg-kw-dark text-white rounded-full px-8 h-12 font-bold text-[13px] w-full sm:w-auto">
              Download the App
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
