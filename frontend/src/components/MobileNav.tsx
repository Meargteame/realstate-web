import { Link, useLocation } from "react-router-dom";
import { Search, Home, Users, User, Heart } from "lucide-react";

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Search', icon: Search, path: '/properties' },
    { label: 'Saved', icon: Heart, path: '/saved' },
    { label: 'Agents', icon: Users, path: '/agents' },
    { label: 'Menu', icon: User, path: '/login' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50 flex items-center justify-around px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
        return (
          <Link 
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              isActive ? 'text-[#b40101]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}