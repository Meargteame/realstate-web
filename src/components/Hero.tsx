import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="w-full flex flex-col relative z-0">
      <div className="relative h-[80vh] min-h-[600px] md:h-[85vh] md:min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        {/* Animated Background Image */}
        <motion.div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=2560&q=80")',
          }}
        />
        
        <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[1px]" />

        <div className="relative z-10 w-full max-w-[1000px] px-6 text-white flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start w-full max-w-[800px]"
          >
            <h1 className="text-[48px] md:text-[64px] font-medium leading-[1.1] mb-10 text-white drop-shadow-md tracking-tight">
              Let's find your dream home
            </h1>

            <div className="flex gap-6 mb-4 text-[11px] uppercase tracking-widest font-bold">
              <button className="border-b-2 border-white pb-1">Buy</button>
              <button className="text-white/60 hover:text-white transition-colors border-b-2 border-transparent hover:border-white/50 pb-1">Rent</button>
              <button className="text-white/60 hover:text-white transition-colors border-b-2 border-transparent hover:border-white/50 pb-1">Find a KW® Agent</button>
            </div>

            <div className="w-full relative flex items-center bg-white rounded-full p-1.5 shadow-2xl">
              <div className="flex items-center flex-1 pl-4">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="City, Neighborhood, Address, Postal Code, School District" 
                  className="w-full border-none outline-none focus:ring-0 bg-transparent text-gray-800 text-[15px] ml-3 placeholder:text-gray-400"
                />
              </div>
              <Button className="bg-[#111827] hover:bg-black text-white rounded-full px-8 h-[48px] font-bold text-[14px]">
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative w-full bg-[#1e2433] text-gray-300 z-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-6 text-[14px]">
          <p>Want to see great homes in your area? Share your current location.</p>
          <Button variant="outline" className="border-gray-500 text-white hover:bg-white hover:text-black rounded-full px-6 h-10 font-medium text-[12px] gap-2 transition-all duration-300 bg-white/5 mt-3 md:mt-0">
            Allow Location Sharing
          </Button>
        </div>
      </div>
    </section>
  );
}
