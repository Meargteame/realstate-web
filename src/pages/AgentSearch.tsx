import AgentCard, { AgentProps } from "@/components/AgentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Sparkles, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockAgents: AgentProps[] = [
  {
    name: "Michael Crown",
    office: "Keller Williams Realty",
    license: "DRE# 01234567",
    languages: ["English"],
    phone: "(818) 432-1501",
    email: "michael@kw.com",
    isLuxury: false,
  },
  {
    name: "JORGE FLORES MORA",
    office: "Keller Williams Realty Studio City",
    license: "DRE# 01235480 - CA",
    languages: ["English"],
    phone: "(818) 432-1501",
    email: "jorgefm3@yahoo.com",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    isLuxury: false,
  },
  {
    name: "Jennifer Hensley",
    office: "KW Johnson City",
    license: "557380 - TN",
    languages: ["English"],
    phone: "(830) 998-1812",
    email: "j.hensley@kw.com",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    isLuxury: false,
  },
  {
    name: "Anna Gallo",
    office: "Keller Williams Paint Creek",
    license: "6501165214 - MI",
    languages: ["English"],
    phone: "(586) 530-3868",
    email: "anna@kw.com",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    isLuxury: false,
  },
  {
    name: "Renee M. Pina",
    office: "Keller Williams Realty Pacific Estates",
    license: "01218728 - CA",
    languages: ["English"],
    phone: "(949) 698-2003",
    email: "reneempina@kw.com",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    isLuxury: true,
  },
  {
    name: "Rebecca Daboub",
    office: "Keller Williams Realty Atlanta Partners",
    license: "165090 - GA",
    languages: ["English"],
    phone: "(770) 841-7062",
    email: "agentwithaheart@aol.com",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    isLuxury: false,
  },
  {
    name: "Beatriz Ryan",
    office: "Keller Williams Realty Group",
    license: "Pending",
    languages: ["Spanish"],
    phone: "(555) 123-4567",
    email: "beatriz@kw.com",
    isLuxury: false,
  },
  {
    name: "James O'Neal",
    office: "Keller Williams Realty Revolution",
    license: "6501165214 - MI",
    languages: ["English"],
    phone: "(309) 275-9292",
    email: "jim@oneal-builders.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    isLuxury: false,
  },
];

export default function AgentSearch() {
  return (
    <div className="bg-surface-container-lowest min-h-[calc(100vh-80px)] flex flex-col relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent pointer-events-none" />

      {/* Search Header */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-variant/30 py-5 px-4 sticky top-16 md:top-20 z-40 shadow-sm transition-all duration-300">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface/40 group-focus-within:text-primary transition-colors duration-300" />
            <Input 
              placeholder="Find an agent by city, postal code, or name" 
              className="pl-12 h-[46px] rounded-full border-surface-variant/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-[14px] bg-white dark:bg-black/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] transition-all duration-300"
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 hover:-translate-y-0.5 text-on-primary rounded-full px-10 h-[46px] font-bold text-[14px] w-full md:w-auto shadow-md hover:shadow-xl transition-all duration-300 tracking-wide">
            Search
          </Button>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-start md:ml-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full h-[40px] px-6 border-surface-variant/60 font-semibold text-[13px] gap-2 hover:bg-surface-container hover:text-primary hover:border-primary/30 text-on-surface/80 shadow-sm whitespace-nowrap transition-all duration-300 group">
                  <Globe className="w-[15px] h-[15px] text-on-surface/50 group-hover:text-primary transition-colors" />
                  Languages Spoken
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] p-2 rounded-xl shadow-xl border-surface-variant/40">
                <DropdownMenuItem className="text-[13px] rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary">English</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px] rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary">Spanish</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px] rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary">French</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="rounded-full h-[40px] px-6 border-surface-variant/60 font-semibold text-[13px] gap-2 hover:bg-surface-container hover:text-primary hover:border-primary/30 text-on-surface/80 shadow-sm whitespace-nowrap transition-all duration-300 group">
              <Sparkles className="w-[15px] h-[15px] text-on-surface/50 group-hover:text-primary transition-colors" />
              Luxury
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 md:py-14 w-full flex-1 flex flex-col relative z-10">
        <div className="mb-10 pl-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-2 text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface/60">
              All Agents
            </h1>
            <p className="text-[14px] text-on-surface/50 font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              {mockAgents.length} Results Found
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {mockAgents.map((agent, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-20 mb-8 flex justify-center items-center gap-2 mt-auto">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-[14px] font-semibold hover:bg-surface-container text-on-surface/70 transition-colors">1</Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-[14px] font-semibold bg-primary text-on-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">2</Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-[14px] font-semibold hover:bg-surface-container text-on-surface/70 transition-colors">3</Button>
          <span className="px-3 text-on-surface/40 font-bold">...</span>
          <Button variant="ghost" className="rounded-full h-10 px-5 text-[14px] font-semibold hover:bg-surface-container text-on-surface/70 transition-colors">12382</Button>
        </div>
      </div>
    </div>
  );
}
