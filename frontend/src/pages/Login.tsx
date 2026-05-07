import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, X, AlertCircle } from "lucide-react";
import React, { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      
      const data = await res.json().catch(() => ({ error: "Invalid server response" }));
      
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      const firstName = data.name ? data.name.split(' ')[0] : 'User';

      localStorage.setItem("kw_user", JSON.stringify({
        id: data.id,
        agentId: data.agentId,
        firstName: firstName,
        name: data.name,
        email: data.email,
        role: data.role
      }));
      
      navigate("/command");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* Premium Visual Sidebar */}
      <div className="hidden md:flex md:w-1/2 bg-[#B40101] flex-col items-center justify-center p-12 relative overflow-hidden shadow-2xl z-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#B40101] via-transparent to-[#B40101]/60 mix-blend-multiply border-r border-[#6B0000]"></div>
        <div className="relative z-10 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="text-white text-[100px] font-serif font-black tracking-tighter mb-6 leading-none drop-shadow-2xl">kw</div>
          <h2 className="text-white text-[42px] font-bold mb-6 tracking-tight leading-[1.1] drop-shadow-lg">
            Empowering Agents.<br/>Inspiring Buyers.
          </h2>
          <p className="text-white/90 text-xl font-medium leading-relaxed drop-shadow-md">
            Your premium real estate journey begins here. Connect with elite agents and discover exclusive properties.
          </p>
        </div>
      </div>

      {/* Modern Main Login Area */}
      <div className="flex-1 flex flex-col relative w-full items-center justify-center bg-white px-6 py-12 md:px-16 lg:px-24">
        <Link to="/" className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-all">
          <X className="w-6 h-6" />
        </Link>

        <div className="w-full max-w-[420px]">
          <div className="text-center mb-10">
            <h1 className="text-[34px] font-bold tracking-tight text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-500 text-base font-medium">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#B40101] hover:text-[#8A0000] underline underline-offset-4 font-bold transition-colors">Sign Up</Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-widest pl-1">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#B40101] focus-visible:border-transparent rounded-xl text-base px-5 bg-gray-50 hover:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-[13px] font-bold text-[#B40101] hover:underline underline-offset-4">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pr-12 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#B40101] focus-visible:border-transparent rounded-xl text-base px-5 bg-gray-50 hover:bg-white transition-all shadow-sm"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-[#B40101] bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#111827] hover:bg-black text-white h-14 rounded-xl font-bold text-sm uppercase tracking-widest mt-4 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? "Authenticating..." : "Log In to Dashboard"}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-gray-400">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg' },
              { name: 'Apple', icon: 'https://www.svgrepo.com/show/475633/apple-color.svg' }
            ].map((provider) => (
              <Button key={provider.name} variant="outline" className="h-14 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold gap-3 w-full flex items-center justify-center text-[15px] transition-all shadow-sm">
                <img src={provider.icon} alt={provider.name} className="w-6 h-6" referrerPolicy="no-referrer" />
                <span>Continue with {provider.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
