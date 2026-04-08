import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative h-[600px] md:h-[700px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 text-white">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-10 text-center"
        >
          Let's find your dream home
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <Tabs defaultValue="buy" className="w-fit mx-auto md:mx-0 mb-4">
            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger 
                value="buy" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 border-white rounded-none px-0 pb-1 text-[11px] font-bold uppercase tracking-widest"
              >
                BUY
              </TabsTrigger>
              <TabsTrigger 
                value="rent" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 border-white rounded-none px-0 pb-1 text-[11px] font-bold uppercase tracking-widest"
              >
                RENT
              </TabsTrigger>
              <TabsTrigger 
                value="agent" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 border-white rounded-none px-0 pb-1 text-[11px] font-bold uppercase tracking-widest"
              >
                FIND A KW® AGENT
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex items-center bg-white rounded-full p-1.5 shadow-2xl">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <Input 
                placeholder="City, Neighborhood, Address, Postal Code, School District" 
                className="border-none focus-visible:ring-0 text-kw-dark placeholder:text-gray-400 h-10 text-[15px]"
              />
            </div>
            <Button className="bg-kw-footer hover:bg-kw-dark text-white rounded-full px-8 h-12 font-bold text-[13px]">
              Search
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Location Bar */}
      <div className="absolute bottom-0 w-full bg-kw-footer/90 backdrop-blur-sm py-4 px-6 text-white hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-[14px] font-medium">Want to see great homes in your area? Share your current location.</p>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-kw-footer rounded-full px-6 h-10 font-bold text-[13px] gap-2">
            <Search className="w-4 h-4" />
            Allow Location Sharing
          </Button>
        </div>
      </div>
    </section>
  );
}
