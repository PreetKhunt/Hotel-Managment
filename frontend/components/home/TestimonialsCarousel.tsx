"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import SectionTitle from "@/components/shared/SectionTitle";
import StarRating from "@/components/shared/StarRating";
import { useReviews } from "@/hooks/useReviews";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "#C9A84C",
    "#8B5CF6",
    "#10B981",
    "#3B82F6",
    "#EF4444",
    "#F59E0B",
  ];
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

export default function TestimonialsCarousel() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const VISIBLE = 3;

  const { data: testimonials = [], isLoading, isError } = useReviews();
  const total = testimonials.length;

  const next = useCallback(() => {
    if (total === 0) return;
    setDirection(1);
    setPage((p) => (p + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setDirection(-1);
    setPage((p) => (p - 1 + total) % total);
  }, [total]);

  const variants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4 },
    }),
  };

  // Get 3 visible testimonials (cycled)
  const visible = Array.from({ length: Math.min(VISIBLE, total) }, (_, i) => ({
    testimonial: testimonials[(page + i) % total],
    key: `${page}-${i}`,
  }));

  return (
    <section style={{ background: "#0A0F1E", padding: "6rem 1.5rem", position: "relative", overflow: "hidden" }}>
      {/* Decorative blurred background elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "-10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
        <SectionTitle
          eyebrow="Testimonials"
          title="What Our Guests Say"
          subtitle="Discover why travelers from around the world choose Hospitality Hub for their most memorable stays."
          center
        />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
            <p>Loading guest reviews...</p>
          </div>
        ) : isError || testimonials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
            <p>No reviews available at the moment.</p>
          </div>
        ) : (
          <div style={{ position: "relative", marginTop: "4rem" }}>
            {/* Prev button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              style={{
                position: "absolute",
                left: "-1.25rem",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: "#1A2235",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#C9A84C",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </motion.button>

            {/* Next button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              style={{
                position: "absolute",
                right: "-1.25rem",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: "#1A2235",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#C9A84C",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </motion.button>

            {/* Cards container */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                padding: "0.5rem 0.25rem",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="popLayout" custom={direction}>
                {visible.map(({ testimonial, key }, idx) => {
                  const avatarColor = getAvatarColor(testimonial.name ?? "Guest");
                  return (
                    <motion.div
                      key={key}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.45, ease: "easeInOut", delay: idx * 0.06 }}
                      style={{
                        background: "rgba(26,34,53,0.8)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(201,168,76,0.15)",
                        borderRadius: "1rem",
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Quote icon */}
                      <Quote
                        size={36}
                        style={{
                          color: "rgba(201,168,76,0.15)",
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                          transform: "rotate(180deg)",
                        }}
                      />

                      {/* Header (Rating & Date) */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <StarRating value={testimonial.rating ?? 5} size={15} />
                        <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                          {testimonial.date ? new Date(testimonial.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>

                      {/* Title */}
                      {testimonial.title && (
                        <h4 style={{ margin: 0, color: "#C9A84C", fontSize: "1.05rem", fontWeight: 600 }}>
                          {testimonial.title}
                        </h4>
                      )}

                      {/* Comment text */}
                      <p
                        style={{
                          color: "#CBD5E1",
                          fontSize: "0.95rem",
                          lineHeight: 1.75,
                          fontStyle: "italic",
                          margin: 0,
                          flexGrow: 1,
                        }}
                      >
                        &ldquo;{testimonial.comment}&rdquo;
                      </p>

                      {/* Room & Stay Type Tags */}
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "auto" }}>
                        {testimonial.roomType && (
                          <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", background: "rgba(255,255,255,0.05)", borderRadius: "4px", color: "#94A3B8" }}>
                            {testimonial.roomType}
                          </span>
                        )}
                        {testimonial.stayType && (
                          <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", background: "rgba(201,168,76,0.1)", borderRadius: "4px", color: "#C9A84C" }}>
                            {testimonial.stayType}
                          </span>
                        )}
                      </div>

                      {/* Divider */}
                      <div
                        style={{
                          height: "1px",
                          background: "rgba(201,168,76,0.15)",
                          margin: "0.25rem 0",
                        }}
                      />

                      {/* Author */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {/* Avatar */}
                        {testimonial.avatar ? (
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: `2px solid ${avatarColor}60`,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              background: `${avatarColor}25`,
                              border: `2px solid ${avatarColor}60`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: avatarColor,
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(testimonial.name ?? "GU")}
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              color: "#F8FAFC",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            {testimonial.name}
                          </div>
                          <div
                            style={{
                              color: "#94A3B8",
                              fontSize: "0.78rem",
                            }}
                          >
                            {testimonial.country ? `${testimonial.country} • Verified Guest` : (testimonial.role ?? "Verified Guest")}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Dot indicators */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "2.5rem",
              }}
            >
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > page ? 1 : -1);
                    setPage(i);
                  }}
                  style={{
                    width: i === page ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "9999px",
                    background: i === page ? "#C9A84C" : "rgba(201,168,76,0.25)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.3s ease",
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
