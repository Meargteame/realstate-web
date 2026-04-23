import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, X } from "lucide-react";
import React, { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      localStorage.setItem("kw_user", JSON.stringify({
        id: data.id,
        agentId: data.agentId,
        firstName: data.name.split(' ')[0],
        name: data.name,
        email: data.email,
        role: data.role
      }));
      navigate("/command");
    } catch (err: any) {
      setError(err.message || "Connection error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Visual / Branding Sidebar */}
      <div className="hidden md:flex md:w-[45%] bg-[#b40101] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80')] bg-cover mix-blend-overlay opacity-20"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="text-white text-[80px] font-serif font-black tracking-tighter mb-8 leading-none">kw</div>
          <h2 className="text-white text-[32px] font-bold mb-6 tracking-tight leading-[1.2]">Empowering Agents.<br/>Inspiring Buyers.</h2>
          <p className="text-white/80 text-lg font-medium max-w-md">Access your saved properties, connect with elite agents, and manage your real estate journey.</p>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="flex-1 flex flex-col relative w-full items-center justify-center bg-white px-6 py-12 md:px-12">
        <Link to="/" className="absolute top-6 right-6 md:top-10 md:right-10 z-50 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
          <X className="w-6 h-6" />
        </Link>

        <div className="w-full max-w-[440px]">
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-[32px] font-bold tracking-tight text-gray-900 mb-3">Log In to Your Account</h1>
            <p className="text-gray-500 text-[15px] font-medium">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#b40101] hover:text-[#8a0000] underline underline-offset-4 font-bold">Sign Up</Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 border-gray-300 focus-visible:ring-2 focus-visible:ring-[#b40101] rounded-full text-base px-4 bg-gray-50/50"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Password</label>
                <Link to="#" className="text-[13px] font-bold text-[#b40101] hover:underline underline-offset-4">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pr-12 border-gray-300 focus-visible:ring-2 focus-visible:ring-[#b40101] rounded-full text-base px-4 bg-gray-50/50"
                  required
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-gray-400 hover:text-black hover:bg-transparent">
                  <Eye className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-[#b40101] font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-[#111827] hover:bg-black text-white h-14 rounded-full font-bold text-[15px] uppercase tracking-widest mt-2 shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all">
              {loading ? "Authenticating..." : "Log In"}
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

          <div className="grid grid-cols-1 gap-4">
            {[
              { name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg' },
              { name: 'Apple', icon: 'https://www.svgrepo.com/show/475633/apple-color.svg' },
              { name: 'Facebook', icon: 'https://www.svgrepo.com/show/475647/facebook-color.svg' }
            ].map((provider) => (
              <Button key={provider.name} variant="outline" className="h-14 rounded-full border-gray-300 hover:bg-gray-50 text-gray-700 font-bold gap-3 w-full flex items-center justify-center text-[15px]">
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
