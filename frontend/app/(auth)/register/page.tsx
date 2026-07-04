"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/";
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Account created successfully");
      router.push(next);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    window.location.href = `${baseUrl}/auth/google?next=${encodeURIComponent(next)}`;
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
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Account</h1>
          <p style={{ color: "#94A3B8" }}>Join Hospitality Hub for a luxury experience.</p>
        </div>

        <div className="rounded-2xl p-8 border"
             style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(201,168,76,0.15)", backdropFilter: "blur(20px)" }}>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "#F8FAFC" }}>First Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-all bg-transparent"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                    placeholder="John"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "#F8FAFC" }}>Last Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-all bg-transparent"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "#F8FAFC" }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-all bg-transparent"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "#F8FAFC" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-all bg-transparent"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A07A2E)", color: "#0A0F1E" }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t relative text-center" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <span className="absolute top-[-10px] left-1/2 -translate-x-1/2 px-2 text-xs" style={{ background: "transparent", color: "#94A3B8" }}>
              OR
            </span>
            
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 border transition-all"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "white", background: "rgba(255,255,255,0.02)" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "#94A3B8" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline transition-all" style={{ color: "#C9A84C" }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]"><Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
