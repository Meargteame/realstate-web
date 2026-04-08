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
    <div className="bg-kw-gray min-h-screen pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Find an agent by city, postal code, or name" 
                className="pl-12 h-14 rounded-full border-gray-200 focus-visible:ring-kw-red"
              />
            </div>
            <Button className="bg-kw-footer hover:bg-kw-dark text-white rounded-full px-10 h-14 font-bold text-[15px] w-full md:w-auto">
              Search
            </Button>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" className="rounded-full h-14 px-6 border-gray-200 font-medium gap-2" />}>
                  <Globe className="w-4 h-4" />
                  Languages Spoken
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Spanish</DropdownMenuItem>
                  <DropdownMenuItem>French</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="rounded-full h-14 px-6 border-gray-200 font-medium gap-2">
                <Sparkles className="w-4 h-4" />
                Luxury
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">All Agents</h1>
          <p className="text-gray-500 font-bold">{mockAgents.length} Results</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockAgents.map((agent, i) => (
            <AgentCard key={i} agent={agent} />
          ))}
        </div>

        {/* Pagination placeholder */}
        <div className="mt-16 flex justify-center items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">1</Button>
          <Button variant="ghost" size="icon" className="rounded-full">2</Button>
          <Button variant="ghost" size="icon" className="rounded-full">3</Button>
          <span className="px-2">...</span>
          <Button variant="ghost" className="rounded-full">12382</Button>
        </div>
      </div>
    </div>
  );
}
