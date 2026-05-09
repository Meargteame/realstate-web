import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, AlertCircle } from "lucide-react";
import React, { useState } from "react";

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("First name, last name, email, and password are all required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          email: email.trim(), 
          password, 
          role 
        })
      });
      
      const data = await res.json().catch(() => ({ error: "Invalid server response" }));
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      const safeName = data.name ? data.name : `${firstName.trim()} ${lastName.trim()}`;

      localStorage.setItem("kw_user", JSON.stringify({
        id: data.id,
        agentId: data.agentId,
        firstName: firstName.trim(),
        name: safeName,
        email: data.email,
        role: data.role,
        token: data.token  // Save the token!
      }));
      
      navigate("/command");
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* Premium Visual Sidebar */}
      <div className="hidden md:flex md:w-1/2 bg-[#111827] flex-col items-center justify-center p-12 relative overflow-hidden shadow-2xl z-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-[#111827]/80 mix-blend-multiply border-r border-[#1F2937]"></div>
        <div className="relative z-10 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="text-[#B40101] text-[100px] font-serif font-black tracking-tighter mb-6 leading-none drop-shadow-2xl">kw</div>
          <h2 className="text-white text-[42px] font-bold mb-6 tracking-tight leading-[1.1] drop-shadow-lg">
            Join the largest<br/>real estate network.
          </h2>
          <p className="text-white/90 text-xl font-medium leading-relaxed drop-shadow-md">
            Create your free Keller Williams account to unlock premium searches and expert matchmaking.
          </p>
        </div>
      </div>

      {/* Main SignUp Area */}
      <div className="flex-1 flex flex-col relative w-full items-center justify-center bg-white px-6 py-12 md:px-16 lg:px-24">
        <Link to="/" className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-all">
          <X className="w-6 h-6" />
        </Link>

        <div className="w-full max-w-[460px]">
          <div className="text-center mb-10">
            <h1 className="text-[34px] font-bold tracking-tight text-gray-900 mb-3">Create an Account</h1>
            <p className="text-gray-500 text-base font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-[#B40101] hover:text-[#8A0000] underline underline-offset-4 font-bold transition-colors">Log In</Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-widest pl-1">First Name</label>
                <Input 
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-14 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#B40101] focus-visible:border-transparent rounded-xl text-base px-5 bg-gray-50 hover:bg-white transition-all shadow-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-widest pl-1">Last Name</label>
                <Input 
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-14 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#B40101] focus-visible:border-transparent rounded-xl text-base px-5 bg-gray-50 hover:bg-white transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-widest pl-1">Account Type</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-14 w-full border border-gray-200 focus:ring-2 focus:ring-[#B40101] focus:border-transparent rounded-xl text-base px-5 bg-gray-50 hover:bg-white transition-all shadow-sm outline-none appearance-none cursor-pointer"
              >
                <option value="agent">Agent Account</option>
                <option value="user">Buyer / Seller Account</option>
              </select>
            </div>

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
              <label className="text-xs font-bold text-gray-800 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a strong password"
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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center font-medium mt-8 leading-relaxed">
            By creating an account, you agree to our <Link to="#" className="text-gray-900 underline underline-offset-2 hover:text-[#B40101]">Terms of Use</Link> and <Link to="#" className="text-gray-900 underline underline-offset-2 hover:text-[#B40101]">Privacy Policy</Link>.
          </p>

          <div className="relative my-8">
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
