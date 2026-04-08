import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function SignUp() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury Home" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-kw-footer/40 backdrop-blur-[2px]" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col p-6 md:p-20 relative">
        <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-kw-dark transition-colors">
          <X className="w-8 h-8" />
        </Link>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <span className="text-kw-red text-6xl font-bold tracking-tighter">kw</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
            <p className="text-gray-500 text-[15px]">
              Already have an account? <Link to="/login" className="text-kw-red hover:underline">Log In</Link>
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">First Name</label>
                <Input className="h-12 border-gray-200 focus-visible:ring-kw-red rounded-md" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">Last Name</label>
                <Input className="h-12 border-gray-200 focus-visible:ring-kw-red rounded-md" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">Email</label>
              <Input 
                type="email" 
                className="h-12 border-gray-200 focus-visible:ring-kw-red rounded-md"
              />
            </div>

            <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white h-14 rounded-full font-bold text-[15px] mt-4">
              Next
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[13px] uppercase tracking-widest">
              <span className="bg-white px-4 text-gray-400">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="h-12 rounded-full border-gray-200 font-bold gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
              <span className="hidden sm:inline">Google</span>
            </Button>
            <Button variant="outline" className="h-12 rounded-full border-gray-200 font-bold gap-2">
              <img src="https://www.svgrepo.com/show/475633/apple-color.svg" alt="Apple" className="w-5 h-5" referrerPolicy="no-referrer" />
              <span className="hidden sm:inline">Apple</span>
            </Button>
            <Button variant="outline" className="h-12 rounded-full border-gray-200 font-bold gap-2">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" referrerPolicy="no-referrer" />
              <span className="hidden sm:inline">Facebook</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
