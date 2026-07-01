import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const missingParams = !token || !email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("New password is required.");
      return;
    }
    if (!confirm) {
      setError("Please confirm your new password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password })
      });

      const data = await res.json().catch(() => ({ error: "Invalid server response" }));

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-10">
          <h1 className="text-[34px] font-bold tracking-tight text-gray-900 mb-3">Choose a New Password</h1>
          <p className="text-gray-500 text-base font-medium">
            {email ? <>Resetting the password for <strong>{email}</strong>.</> : "Set a new password for your account."}
          </p>
        </div>

        {missingParams ? (
          <div className="space-y-6">
            <div role="alert" className="flex items-start gap-3 text-[#B40101] bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm font-bold">
                This reset link is invalid or incomplete. Please request a new one.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button className="w-full bg-[#B40101] hover:bg-[#8A0000] text-white h-14 rounded-xl font-bold text-sm uppercase tracking-widest">
                Request New Link
              </Button>
            </Link>
          </div>
        ) : done ? (
          <div className="space-y-6">
            <div role="alert" className="flex items-start gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm font-semibold">
                Your password has been reset. Redirecting you to login...
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full bg-[#B40101] hover:bg-[#8A0000] text-white h-14 rounded-xl font-bold text-sm uppercase tracking-widest">
                Go to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-widest pl-1">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="New password"
                  className="h-14 pr-12 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#B40101] focus-visible:border-transparent rounded-xl text-base px-5 bg-gray-50 hover:bg-white transition-all shadow-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-widest pl-1">Confirm Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-label="Confirm password"
                className="h-14 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#B40101] focus-visible:border-transparent rounded-xl text-base px-5 bg-gray-50 hover:bg-white transition-all shadow-sm"
              />
            </div>

            {error && (
              <div role="alert" className="flex items-center gap-3 text-[#B40101] bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B40101] hover:bg-[#8A0000] text-white h-14 rounded-xl font-bold text-sm uppercase tracking-widest shadow-[0_8px_16px_rgba(180,1,1,0.3)] transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
