import { Button } from "@/components/ui/button";
import { Search, Menu, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  return (
    <header className="w-full bg-[#eef1f4] sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="hidden md:flex justify-end items-center px-6 py-1.5 text-[11px] font-bold text-gray-300 bg-[#1e2433] uppercase tracking-[0.05em] gap-6 w-full">
        <Link to="#" className="hover:text-white transition-colors">Luxury</Link>
        <Link to="#" className="hover:text-white transition-colors">Land</Link>
        <Link to="#" className="hover:text-white transition-colors">Commercial</Link>
        <Link to="#" className="hover:text-white transition-colors">Worldwide</Link>
        <span className="text-gray-500">|</span>
        <div className="flex items-center gap-1 hover:text-white transition-colors outline-none cursor-pointer">
          <Globe className="w-3.5 h-3.5" />
          <span className="ml-1 uppercase">EN</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-[1400px] mx-auto px-6 h-[80px] flex items-center justify-between">
        
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center">
            <span className="text-on-surface text-2xl font-black tracking-tight">ESTATE</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-bold text-gray-900">
            <Link to="#" className="hover:text-primary transition-colors text-on-surface">Search</Link>
            <Link to="/agents" className="hover:text-primary transition-colors text-on-surface">Find an Agent</Link>
            <Link to="/become-agent" className="hover:text-primary transition-colors text-on-surface">Become an Agent</Link>
          </nav>
        </div>

        {/* Right Section: Search & Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button className="bg-[#111827] hover:bg-black text-white rounded-md px-6 h-[38px] font-medium text-[13px] transition-colors">
              Log In / Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white text-on-surface">
              <nav className="flex flex-col gap-6 mt-10">
                <Link to="/" className="text-lg font-bold">Home</Link>
                <Link to="#" className="text-lg font-bold">Search</Link>
                <Link to="/agents" className="text-lg font-bold">Find an Agent</Link>
                <Link to="/become-agent" className="text-lg font-bold">Become an Agent</Link>
                <div className="mt-4">
                  <Button className="w-full bg-[#111827] text-white">Log In / Sign Up</Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
