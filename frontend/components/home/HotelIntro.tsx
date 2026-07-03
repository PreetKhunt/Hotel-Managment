"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import SectionTitle from "@/components/shared/SectionTitle";

function CountUp({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  { target: 500, suffix: "+", label: "Rooms" },
  { target: 25, suffix: "+", label: "Years" },
  { prefix: "", target: 49, suffix: "", label: "Rating", display: "4.9 ★" },
];

export default function HotelIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "#0A0F1E",
        padding: "6rem 1.5rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        {/* Left: Text content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionTitle
            eyebrow="About Us"
            title="A Legacy of Luxury Hospitality"
            center={false}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              color: "#94A3B8",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              marginBottom: "1.25rem",
            }}
          >
            For over two and a half decades, Hospitality Hub has set the gold
            standard in luxury accommodation. Nestled in the heart of the city,
            our hotel is a sanctuary of refined elegance — where impeccable
            service meets breathtaking design. Every corner tells a story of
            craftsmanship and devotion.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              color: "#94A3B8",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              marginBottom: "2.5rem",
            }}
          >
            Our philosophy is simple: treat every guest as royalty. From the
            moment you arrive, a dedicated team anticipates your every need —
            ensuring an experience that transcends expectation. Whether for
            business or leisure, every stay becomes an unforgettable chapter.
          </motion.p>

          {/* Stat counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
          >
            {[
              { target: 500, suffix: "+", label: "Rooms" },
              { target: 25, suffix: "+", label: "Years" },
              { target: null, label: "Rating", display: "4.9 ★" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.55 + i * 0.12 }}
                style={{
                  background: "rgba(201,168,76,0.07)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#C9A84C",
                    fontSize: "2rem",
                    fontWeight: 800,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    lineHeight: 1,
                    marginBottom: "0.35rem",
                  }}
                >
                  {stat.display ? (
                    stat.display
                  ) : (
                    <CountUp
                      target={stat.target as number}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Stacked images */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{ position: "relative", minHeight: "480px" }}
        >
          {/* Main image */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "80%",
              aspectRatio: "4/5",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600"
              alt="Luxury hotel room"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(10,15,30,0.4), transparent)",
              }}
            />
          </motion.div>

          {/* Secondary image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "55%",
              aspectRatio: "1",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              border: "3px solid #1A2235",
              zIndex: 3,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"
              alt="Hotel lobby"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </motion.div>

          {/* Floating gold badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
            style={{
              position: "absolute",
              top: "12%",
              right: "10%",
              zIndex: 5,
              background: "#C9A84C",
              color: "#0A0F1E",
              borderRadius: "50%",
              width: "90px",
              height: "90px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.75rem",
              textAlign: "center",
              lineHeight: 1.3,
              boxShadow: "0 8px 24px rgba(201,168,76,0.5)",
            }}
          >
            <span style={{ fontSize: "1.4rem", fontWeight: 900 }}>★</span>
            5-Star
            <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>Luxury</span>
          </motion.div>

          {/* Decorative gold ring */}
          <div
            style={{
              position: "absolute",
              top: "-2rem",
              left: "-2rem",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "2px solid rgba(201,168,76,0.2)",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-1.25rem",
              left: "-1.25rem",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              border: "1px solid rgba(201,168,76,0.1)",
              zIndex: 1,
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
