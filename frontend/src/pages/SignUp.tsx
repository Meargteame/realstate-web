import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { X, Eye } from "lucide-react";
import React, { useState } from "react";

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent"); // Default to agent

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Visual / Branding Sidebar */}
      <div className="hidden md:flex md:w-[45%] bg-[#111827] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80')] bg-cover mix-blend-overlay opacity-30"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="text-[#b40101] text-[80px] font-serif font-black tracking-tighter mb-8 leading-none drop-shadow-lg">kw</div>
          <h2 className="text-white text-[32px] font-bold mb-6 tracking-tight leading-[1.2]">Join the largest<br/>real estate network.</h2>
          <p className="text-white/80 text-lg font-medium max-w-md">Create your free Keller Williams account to unlock premium searches and expert matchmaking.</p>
        </div>
      </div>

      {/* Main SignUp Area */}
      <div className="flex-1 flex flex-col relative w-full items-center justify-center bg-white px-6 py-12 md:px-12">
        <Link to="/" className="absolute top-6 right-6 md:top-10 md:right-10 z-50 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
          <X className="w-6 h-6" />
        </Link>

        <div className="w-full max-w-[440px]">
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-[32px] font-bold tracking-tight text-gray-900 mb-3">Create an Account</h1>
            <p className="text-gray-500 text-[15px] font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-[#b40101] hover:text-[#8a0000] underline underline-offset-4 font-bold">Log In</Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">First Name</label>
                <Input 
                  placeholder="First"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-14 border-gray-300 focus-visible:ring-2 focus-visible:ring-[#b40101] rounded-full text-base px-4 bg-gray-50/50" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Last Name</label>
                <Input 
                  placeholder="Last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-14 border-gray-300 focus-visible:ring-2 focus-visible:ring-[#b40101] rounded-full text-base px-4 bg-gray-50/50" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Account Type</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-14 w-full border border-gray-300 focus:ring-2 focus:ring-[#b40101] rounded-full text-base px-4 bg-gray-50/50 outline-none"
                required
              >
                <option value="agent">Agent Account</option>
                <option value="user">Buyer/Seller Account</option>
              </select>
            </div>

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
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="Create a password"
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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-[11px] text-gray-400 text-center font-medium mt-6 leading-relaxed">
            By creating an account, you agree to our <Link to="#" className="underline hover:text-gray-900">Terms of Use</Link> and <Link to="#" className="underline hover:text-gray-900">Privacy Policy</Link>.
          </p>

          <div className="relative my-8">
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
