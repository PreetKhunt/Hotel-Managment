"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Mail, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      toast.success("Password reset instructions sent");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0A0F1E" }}>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none" 
           style={{ background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, rgba(10,15,30,0) 70%)" }} />
           
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A07A2E)" }}>
            <Crown className="w-8 h-8 text-white" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p style={{ color: "#94A3B8" }}>Enter your email to receive recovery instructions.</p>
        </div>

        <div className="rounded-2xl p-8 border"
             style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(201,168,76,0.15)", backdropFilter: "blur(20px)" }}>
          
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <p style={{ color: "#F8FAFC" }}>
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </p>
              <Link href="/login" className="inline-block mt-4 text-sm font-medium hover:underline transition-all" style={{ color: "#C9A84C" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "#F8FAFC" }}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-all bg-transparent"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center transition-all disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A07A2E)", color: "#0A0F1E" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </button>

              <div className="text-center mt-4">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-all" style={{ color: "#94A3B8" }}>
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
