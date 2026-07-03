"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, Phone, ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section style={{ padding: "6rem 1.5rem", background: "#0A0F1E" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background: "linear-gradient(135deg, #1A2235 0%, #0F172A 100%)",
            border: "1px solid rgba(201,168,76,0.35)",
            borderRadius: "1.5rem",
            padding: "4rem 2.5rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow:
              "0 0 0 1px rgba(201,168,76,0.08), 0 24px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Gold shimmer top border */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #C9A84C, transparent)",
              borderRadius: "9999px",
            }}
          />

          {/* Radial glow */}
          <div
            style={{
              position: "absolute",
              top: "-30%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              height: "50%",
              background:
                "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Bottom shimmer border */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "20%",
              right: "20%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
              borderRadius: "9999px",
            }}
          />

          {/* Crown icon */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.3)",
              marginBottom: "1.75rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Crown size={32} style={{ color: "#C9A84C" }} />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              color: "#F8FAFC",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "1.25rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            Ready to Experience{" "}
            <span style={{ color: "#C9A84C" }}>True Luxury?</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.42, duration: 0.6 }}
            style={{
              color: "#94A3B8",
              fontSize: "1.05rem",
              lineHeight: 1.75,
              maxWidth: "560px",
              margin: "0 auto 2.5rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            Reserve your stay today and let our dedicated team craft a
            bespoke experience tailored to your every desire. Indulge in the
            pinnacle of elegance — you deserve nothing less.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.5 }}
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Link href="/rooms">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "#C9A84C",
                  color: "#0A0F1E",
                  border: "none",
                  padding: "0.95rem 2.25rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 24px rgba(201,168,76,0.4)",
                  letterSpacing: "0.02em",
                }}
              >
                Book Your Suite Now <ArrowRight size={17} />
              </motion.button>
            </Link>

            <a href="tel:+18001234567">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "transparent",
                  color: "#F8FAFC",
                  border: "1px solid rgba(248,250,252,0.3)",
                  padding: "0.95rem 2.25rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backdropFilter: "blur(8px)",
                  letterSpacing: "0.02em",
                }}
              >
                <Phone size={17} /> Call Us: +91 9974295118
              </motion.button>
            </a>
          </motion.div>

          {/* Decorative corner ornaments */}
          {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos) => {
            const isRight = pos.includes("Right");
            const isBottom = pos.includes("bottom");
            return (
              <div
                key={pos}
                style={{
                  position: "absolute",
                  ...(isBottom ? { bottom: "1rem" } : { top: "1rem" }),
                  ...(isRight ? { right: "1rem" } : { left: "1rem" }),
                  width: "40px",
                  height: "40px",
                  borderTop: isBottom
                    ? "none"
                    : "1px solid rgba(201,168,76,0.25)",
                  borderBottom: isBottom
                    ? "1px solid rgba(201,168,76,0.25)"
                    : "none",
                  borderLeft: isRight
                    ? "none"
                    : "1px solid rgba(201,168,76,0.25)",
                  borderRight: isRight
                    ? "1px solid rgba(201,168,76,0.25)"
                    : "none",
                  borderRadius: isBottom
                    ? isRight
                      ? "0 0 0.5rem 0"
                      : "0 0 0 0.5rem"
                    : isRight
                    ? "0 0.5rem 0 0"
                    : "0.5rem 0 0 0",
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
