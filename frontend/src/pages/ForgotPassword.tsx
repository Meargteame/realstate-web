import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json().catch(() => ({ error: "Invalid server response" }));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSent(true);
      // In development the backend returns a direct link so the flow is testable without email.
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="mb-10">
          <h1 className="text-[34px] font-bold tracking-tight text-gray-900 mb-3">Reset Password</h1>
          <p className="text-gray-500 text-base font-medium">
            Enter the email associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="flex items-start gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">
                If an account exists for <strong>{email.trim()}</strong>, a password reset link is on its way. Check your inbox and spam folder.
              </p>
            </div>

            {devResetUrl && (
              <div className="text-xs bg-gray-100 border border-gray-200 rounded-xl p-4 break-all">
                <p className="font-bold text-gray-700 mb-2 uppercase tracking-wider">Dev mode — reset link:</p>
                <Link to={devResetUrl.replace(/^https?:\/\/[^/]+/, "")} className="text-[#B40101] font-semibold underline">
                  {devResetUrl}
                </Link>
              </div>
            )}

            <Link to="/login">
              <Button className="w-full bg-[#B40101] hover:bg-[#8A0000] text-white h-14 rounded-xl font-bold text-sm uppercase tracking-widest">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            {error && (
              <div className="flex items-center gap-3 text-[#B40101] bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B40101] hover:bg-[#8A0000] text-white h-14 rounded-xl font-bold text-sm uppercase tracking-widest shadow-[0_8px_16px_rgba(180,1,1,0.3)] transition-all disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
