"use client";
import { motion } from "framer-motion";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = true,
  light = false,
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{ marginBottom: "3rem", textAlign: center ? "center" : "left" }}
    >
      {eyebrow && (
        <p
          style={{
            color: "#C9A84C",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        style={{
          color: light ? "#0A0F1E" : "#F8FAFC",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: "1rem",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            color: light ? "#334155" : "#94A3B8",
            fontSize: "1.125rem",
            lineHeight: 1.7,
            maxWidth: "42rem",
            margin: center ? "0 auto" : undefined,
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
