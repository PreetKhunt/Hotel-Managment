"use client";
import { motion } from "framer-motion";
import {
  Wifi,
  UtensilsCrossed,
  Waves,
  Sparkles,
  Dumbbell,
  Car,
  Shield,
  Star,
} from "lucide-react";
import SectionTitle from "@/components/shared/SectionTitle";

const amenities = [
  {
    icon: Wifi,
    label: "Free WiFi",
    desc: "High-speed fibre internet throughout the entire property, every floor.",
  },
  {
    icon: UtensilsCrossed,
    label: "Fine Dining",
    desc: "Award-winning restaurants serving world cuisine crafted by celebrity chefs.",
  },
  {
    icon: Waves,
    label: "Swimming Pool",
    desc: "Infinity pool with panoramic city views, open year-round.",
  },
  {
    icon: Sparkles,
    label: "Luxury Spa",
    desc: "Full-service spa offering rejuvenating treatments and holistic therapies.",
  },
  {
    icon: Dumbbell,
    label: "Fitness Center",
    desc: "State-of-the-art gym with personal trainers available on request.",
  },
  {
    icon: Car,
    label: "Valet Parking",
    desc: "Seamless valet service for your vehicle, 24 hours a day, 7 days a week.",
  },
  {
    icon: Shield,
    label: "24/7 Security",
    desc: "Round-the-clock discreet security ensuring your complete peace of mind.",
  },
  {
    icon: Star,
    label: "Concierge",
    desc: "A dedicated concierge team ready to fulfill your every request and desire.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function AmenitiesGrid() {
  return (
    <section
      style={{
        background: "#111827",
        padding: "6rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background accent */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        <SectionTitle
          eyebrow="World Class"
          title="Premium Amenities"
          subtitle="Every facility is designed to elevate your stay to extraordinary heights of luxury and comfort."
          center
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.75rem",
          }}
        >
          {amenities.map((amenity, i) => {
            const Icon = amenity.icon;
            return (
              <motion.div
                key={amenity.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: "#1A2235",
                  border: "1px solid rgba(201,168,76,0.1)",
                  borderRadius: "1rem",
                  padding: "2rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "1rem",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(201,168,76,0.35)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(201,168,76,0.1)";
                }}
              >
                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.18 }}
                  transition={{ duration: 0.25, type: "spring" }}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 0 0 rgba(201,168,76,0)",
                    transition: "box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 0 18px rgba(201,168,76,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 0 0 0 rgba(201,168,76,0)";
                  }}
                >
                  <Icon size={22} style={{ color: "#C9A84C" }} />
                </motion.div>

                <div>
                  <h3
                    style={{
                      color: "#F8FAFC",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {amenity.label}
                  </h3>
                  <p
                    style={{
                      color: "#94A3B8",
                      fontSize: "0.875rem",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {amenity.desc}
                  </p>
                </div>

                {/* Subtle corner accent */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "60px",
                    height: "60px",
                    borderTop: "1px solid rgba(201,168,76,0.1)",
                    borderLeft: "1px solid rgba(201,168,76,0.1)",
                    borderRadius: "0.5rem 0 1rem 0",
                    pointerEvents: "none",
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
