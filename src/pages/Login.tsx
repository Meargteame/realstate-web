import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Eye, X, Mail, Lock } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Animated Background Image */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/80 via-black/40 to-black/90 backdrop-blur-[2px]" />

      <Link to="/" className="absolute top-6 right-6 md:top-10 md:right-10 z-50 p-3 bg-black/20 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white backdrop-blur-md transition-all duration-300 group">
        <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </Link>

      {/* Floating Glassmorphism Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px] p-8 md:p-12 mx-4"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] -z-10" />

        <div className="flex flex-col items-center justify-center mb-10">
          <div className="flex justify-center mb-4">
            <span className="text-white text-4xl font-black tracking-tighter drop-shadow-md">ESTATE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white tracking-tight text-center">Welcome Back</h1>
          <p className="text-white/60 text-[15px] font-medium text-center">
            Don't have an account? <Link to="/signup" className="text-white hover:text-primary underline underline-offset-4 decoration-white/30 hover:decoration-primary transition-colors">Sign Up</Link>
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-white/50 ml-1">Email</label>
            <div className="relative flex items-center bg-white/5 rounded-2xl p-1 border border-white/10 focus-within:border-white/30 focus-within:bg-white/10 transition-all duration-300 group">
              <Mail className="absolute left-4 w-5 h-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="h-[52px] pl-12 border-none focus-visible:ring-0 rounded-xl bg-transparent text-white placeholder:text-white/30 text-[15px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[12px] font-bold uppercase tracking-widest text-white/50">Password</label>
              <Link to="#" className="text-[12px] font-semibold text-white/50 hover:text-white transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative flex items-center bg-white/5 rounded-2xl p-1 border border-white/10 focus-within:border-white/30 focus-within:bg-white/10 transition-all duration-300 group">
              <Lock className="absolute left-4 w-5 h-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
              <Input 
                type="password" 
                placeholder="Enter your password"
                className="h-[52px] pl-12 pr-12 border-none focus-visible:ring-0 rounded-xl bg-transparent text-white placeholder:text-white/30 text-[15px]"
              />
              <Button variant="ghost" size="icon" className="absolute right-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <Eye className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Button className="w-full bg-[#111827] hover:bg-black border border-transparent hover:border-white/20 text-white h-[56px] rounded-full font-bold text-[15px] mt-8 tracking-wider uppercase shadow-lg transition-all duration-300">
            Log In
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[12px] uppercase tracking-widest">
            <span className="bg-[#101010] px-4 text-white/40 rounded-full border border-white/5 backdrop-blur-md">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg' },
            { name: 'Apple', icon: 'https://www.svgrepo.com/show/475633/apple-color.svg' },
            { name: 'Facebook', icon: 'https://www.svgrepo.com/show/475647/facebook-color.svg' }
          ].map((provider) => (
            <Button key={provider.name} variant="outline" className="h-[52px] rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-2 transition-all duration-300">
              <img src={provider.icon} alt={provider.name} className="w-5 h-5" referrerPolicy="no-referrer" />
              <span className="hidden sm:inline text-[13px]">{provider.name}</span>
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
