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
    <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="hidden md:flex justify-end items-center px-6 py-2 text-[11px] font-medium text-gray-500 border-b border-gray-50 uppercase tracking-wider gap-6">
        <Link to="#" className="hover:text-kw-red transition-colors">Luxury</Link>
        <Link to="#" className="hover:text-kw-red transition-colors">Land</Link>
        <Link to="#" className="hover:text-kw-red transition-colors">Commercial</Link>
        <Link to="#" className="hover:text-kw-red transition-colors">Worldwide</Link>
        <div className="h-3 w-[1px] bg-gray-300 mx-1" />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 hover:text-kw-red transition-colors outline-none">
            <Globe className="w-3 h-3" />
            <span>EN</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Español</DropdownMenuItem>
            <DropdownMenuItem>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-kw-red text-3xl md:text-4xl font-bold tracking-tighter">kw</span>
          <span className="text-[10px] font-bold text-kw-red mt-3 ml-0.5">®</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-kw-dark">
          <Link to="#" className="flex items-center gap-2 hover:text-kw-red transition-colors">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Link>
          <Link to="/agents" className="hover:text-kw-red transition-colors">Find a KW® Agent</Link>
          <Link to="#" className="hover:text-kw-red transition-colors">Become a KW® Agent</Link>
          <Link to="/login">
            <Button className="bg-kw-footer hover:bg-kw-dark text-white rounded-full px-6 h-11 font-bold text-[13px]">
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
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-10">
                <Link to="/" className="text-lg font-bold">Home</Link>
                <Link to="/agents" className="text-lg font-bold">Find an Agent</Link>
                <Link to="#" className="text-lg font-bold">Search Properties</Link>
                <Link to="#" className="text-lg font-bold">Become an Agent</Link>
                <div className="h-[1px] bg-gray-100 my-2" />
                <Link to="#" className="text-sm text-gray-500">Luxury</Link>
                <Link to="#" className="text-sm text-gray-500">Land</Link>
                <Link to="#" className="text-sm text-gray-500">Commercial</Link>
                <Link to="#" className="text-sm text-gray-500">Worldwide</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
