import { Button } from "@/components/ui/button";
import { Globe, Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  return (
    <header className="w-full bg-surface-container-low sticky top-0 z-50">
      {/* Top Bar */}
      <div className="hidden md:flex justify-end items-center px-6 py-2 text-[11px] font-bold text-on-surface/60 uppercase tracking-wider gap-6">
        <Link to="#" className="hover:text-secondary transition-colors">Luxury</Link>
        <Link to="#" className="hover:text-secondary transition-colors">Land</Link>
        <Link to="#" className="hover:text-secondary transition-colors">Commercial</Link>
        <Link to="#" className="hover:text-secondary transition-colors">Worldwide</Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 hover:text-secondary transition-colors outline-none cursor-pointer ml-2">
            <Globe className="w-3 h-3" />
            <span>EN</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-surface-container-lowest">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Español</DropdownMenuItem>
            <DropdownMenuItem>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-secondary text-3xl md:text-4xl font-bold tracking-tighter">kw</span>
          <span className="text-[10px] font-bold text-secondary mt-3 ml-0.5">®</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold text-primary">
          <Link to="#" className="flex items-center gap-2 hover:text-secondary transition-colors">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Link>
          <Link to="/agents" className="hover:text-secondary transition-colors whitespace-nowrap">Find a KW® Agent</Link>
          <Link to="#" className="hover:text-secondary transition-colors whitespace-nowrap">Become a KW® Agent</Link>
          <Link to="/login" className="whitespace-nowrap">
            <Button className="bg-primary-container hover:bg-black text-white rounded-md px-6 h-11 font-bold text-[13px] whitespace-nowrap min-w-max">
              Log In / Sign Up
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="font-bold text-sm">Log In</Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-surface-container-lowest">
              <nav className="flex flex-col gap-6 mt-10">
                <Link to="/" className="text-lg font-bold">Home</Link>
                <Link to="/agents" className="text-lg font-bold">Find an Agent</Link>
                <Link to="#" className="text-lg font-bold">Search Properties</Link>
                <Link to="#" className="text-lg font-bold">Become an Agent</Link>
                <div className="h-[1px] bg-surface-container-low my-2" />
                <Link to="#" className="text-sm text-on-surface/70">Luxury</Link>
                <Link to="#" className="text-sm text-on-surface/70">Land</Link>
                <Link to="#" className="text-sm text-on-surface/70">Commercial</Link>
                <Link to="#" className="text-sm text-on-surface/70">Worldwide</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
