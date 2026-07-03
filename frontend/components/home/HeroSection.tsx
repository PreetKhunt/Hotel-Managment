"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronDown, Search, Users, Calendar } from "lucide-react";
import Link from "next/link";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 3,
  duration: Math.random() * 4 + 4,
}));

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export default function HeroSection() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />

      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,15,30,0.72) 0%, rgba(10,15,30,0.60) 50%, rgba(10,15,30,0.92) 100%)",
          zIndex: 1,
        }}
      />

      {/* Floating gold particles */}
      {mounted &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "#C9A84C",
              opacity: 0.3,
              zIndex: 2,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Hero content */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "900px",
          width: "100%",
          paddingTop: "5rem",
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: "100%" }}
        >
          {/* Eyebrow */}
          <motion.p
            variants={itemVariants}
            style={{
              color: "#C9A84C",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 40,
                height: 1,
                background: "#C9A84C",
              }}
            />
            Welcome to Hospitality Hub
            <span
              style={{
                display: "inline-block",
                width: 40,
                height: 1,
                background: "#C9A84C",
              }}
            />
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            style={{
              color: "#F8FAFC",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2.6rem, 7vw, 5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Luxury Redefined.{" "}
            <span style={{ color: "#C9A84C" }}>Comfort</span> Perfected.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            style={{
              color: "#CBD5E1",
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              lineHeight: 1.75,
              marginBottom: "2.5rem",
              maxWidth: "640px",
              margin: "0 auto 2.5rem",
            }}
          >
            Experience unparalleled elegance in every detail. From world-class
            dining to rejuvenating spa treatments — your sanctuary awaits.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "3.5rem",
            }}
          >
            <Link href="/rooms">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "#C9A84C",
                  color: "#0A0F1E",
                  border: "none",
                  padding: "0.9rem 2.25rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
                }}
              >
                Book Your Stay
              </motion.button>
            </Link>
            <Link href="/rooms">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "transparent",
                  color: "#F8FAFC",
                  border: "2px solid rgba(248,250,252,0.5)",
                  padding: "0.9rem 2.25rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  backdropFilter: "blur(8px)",
                }}
              >
                Explore Rooms
              </motion.button>
            </Link>
          </motion.div>

          {/* Quick Search Bar */}
          <motion.div
            variants={itemVariants}
            style={{
              background: "rgba(26,34,53,0.85)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "1rem",
              padding: "1.25rem 1.5rem",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "center",
              maxWidth: "860px",
              width: "100%",
              margin: "0 auto",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Check-in */}
            <div style={{ flex: "1 1 180px", minWidth: "160px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#C9A84C",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                }}
              >
                <Calendar size={12} /> Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(10,15,30,0.6)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "0.5rem",
                  color: "#F8FAFC",
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.9rem",
                  outline: "none",
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* Check-out */}
            <div style={{ flex: "1 1 180px", minWidth: "160px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#C9A84C",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                }}
              >
                <Calendar size={12} /> Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(10,15,30,0.6)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "0.5rem",
                  color: "#F8FAFC",
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.9rem",
                  outline: "none",
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* Guests */}
            <div style={{ flex: "1 1 140px", minWidth: "120px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#C9A84C",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                }}
              >
                <Users size={12} /> Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(10,15,30,0.6)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "0.5rem",
                  color: "#F8FAFC",
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.9rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} style={{ background: "#1A2235" }}>
                    {n} Guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <Link href="/rooms">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "#C9A84C",
                  color: "#0A0F1E",
                  border: "none",
                  padding: "0.65rem 1.75rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 12px rgba(201,168,76,0.3)",
                  height: "fit-content",
                  alignSelf: "flex-end",
                }}
              >
                <Search size={16} />
                Search
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
          cursor: "pointer",
        }}
        onClick={() =>
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
        }
      >
        <span
          style={{
            color: "#94A3B8",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={22} style={{ color: "#C9A84C" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
