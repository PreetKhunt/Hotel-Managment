"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Crown, Phone, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Services", href: "/services" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  console.log(`[Auth Audit] Navbar render: isLoading=${isLoading}, user=${!!user}, branch=${!isLoading ? (user ? 'User Menu' : 'Login Button') : 'Loading'}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      animate={{
        backgroundColor: scrolled ? "rgba(10,15,30,0.95)" : "rgba(0, 0, 0, 0)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottomColor: scrolled ? "rgba(201,168,76,0.2)" : "rgba(0, 0, 0, 0)",
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 border-b"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A07A2E)" }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg leading-tight">
                Hospitality Hub
              </p>
              <p className="text-xs leading-tight" style={{ color: "#C9A84C", letterSpacing: "0.15em" }}>
                LUXURY HOTEL
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="animated-underline text-sm font-medium transition-colors duration-200"
                style={{ color: "#94A3B8" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                {link.label}
              </Link>
            ))}
            
            {!isLoading && (
              user ? (
                <Link
                  href="/dashboard"
                  className="animated-underline text-sm font-medium transition-colors duration-200"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                >
                  Dashboard
                </Link>
              ) : null
            )}
          </div>

          {/* Desktop CTA & Auth */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              user ? (
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#94A3B8";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
                  style={{ color: "#F8FAFC", background: "rgba(255,255,255,0.05)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </Link>
              )
            )}
            
            <Link
              href="/rooms"
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ml-2"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #A07A2E)",
                color: "#0A0F1E",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 25px rgba(201,168,76,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: "#C9A84C", background: "rgba(201,168,76,0.1)" }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t"
            style={{
              background: "rgba(10,15,30,0.98)",
              borderColor: "rgba(201,168,76,0.2)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-base font-medium py-2"
                    style={{ color: "#94A3B8" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {!isLoading && (
                user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="block text-base font-medium py-2"
                        style={{ color: "#94A3B8" }}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <button
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="block text-base font-medium py-2 w-full text-left"
                        style={{ color: "#ef4444" }}
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-base font-medium py-2"
                      style={{ color: "#F8FAFC" }}
                    >
                      Sign In
                    </Link>
                  </motion.div>
                )
              )}
              
              <div className="pt-4 border-t" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
                <Link
                  href="/rooms"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-3 rounded-full text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg,#C9A84C,#A07A2E)", color: "#0A0F1E" }}
                >
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
