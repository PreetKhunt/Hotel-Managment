"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionTitle from "@/components/shared/SectionTitle";
import StarRating from "@/components/shared/StarRating";
import { useRooms } from "@/hooks/useRooms";
import { Room } from "@/types";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const typeColors: Record<string, string> = {
  standard: "#94A3B8",
  deluxe: "#C9A84C",
  suite: "#8B5CF6",
  penthouse: "#EF4444",
};

export default function FeaturedRooms() {
  const { data: rooms = [], isLoading, isError } = useRooms();
  const featuredRooms = rooms.filter((r: Room) => r.featured);

  return (
    <section style={{ background: "#0D1422", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <SectionTitle
          eyebrow="Accommodations"
          title="Our Finest Rooms"
          subtitle="Each room is a masterpiece of design and comfort, tailored for the most discerning guests."
          center
        />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            <p>Loading featured rooms...</p>
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>
            <p>Failed to load featured rooms.</p>
          </div>
        ) : featuredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            <p>No featured rooms available at the moment.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2rem",
              marginBottom: "3rem",
            }}
          >
            {featuredRooms.slice(0, 3).map((room: Room, i: number) => (
            <motion.div
              key={room.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              style={{
                background: "#1A2235",
                borderRadius: "1rem",
                overflow: "hidden",
                border: "1px solid rgba(201,168,76,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                cursor: "pointer",
              }}
            >
              {/* Room Image */}
              <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                <motion.img
                  src={room.images?.[0] || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600`}
                  alt={room.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800";
                  }}
                  whileHover={{ scale: 1.07 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Dark overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(26,34,53,0.9) 0%, rgba(26,34,53,0.1) 60%)",
                  }}
                />
                {/* Type Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: "0.75rem",
                    left: "0.75rem",
                    background: "rgba(10,15,30,0.7)",
                    color: typeColors[room.type] ?? "#C9A84C",
                    border: `1px solid ${typeColors[room.type] ?? "#C9A84C"}40`,
                    backdropFilter: "blur(8px)",
                    padding: "0.25rem 0.7rem",
                    borderRadius: "9999px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {room.type}
                </span>
                {/* Price overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0.75rem",
                    right: "0.75rem",
                    background: "#C9A84C",
                    color: "#0A0F1E",
                    borderRadius: "0.4rem",
                    padding: "0.25rem 0.65rem",
                    fontWeight: 800,
                    fontSize: "1rem",
                  }}
                >
                  ${room.pricePerNight.toLocaleString()}
                  <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>/night</span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "1.25rem" }}>
                <h3
                  style={{
                    color: "#F8FAFC",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {room.name}
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <StarRating value={room.rating ?? 5} size={14} />
                  <span style={{ color: "#94A3B8", fontSize: "0.8rem" }}>
                    ({room.reviewCount ?? 0} reviews)
                  </span>
                </div>

                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {room.description}
                </p>

                {/* Amenity chips */}
                {room.amenities && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      flexWrap: "wrap",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {room.amenities.slice(0, 3).map((a: string) => (
                      <span
                        key={a}
                        style={{
                          background: "rgba(201,168,76,0.1)",
                          color: "#C9A84C",
                          border: "1px solid rgba(201,168,76,0.2)",
                          padding: "0.15rem 0.6rem",
                          borderRadius: "9999px",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                <Link href={`/rooms/${room.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid rgba(201,168,76,0.4)",
                      color: "#C9A84C",
                      padding: "0.65rem 1rem",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(201,168,76,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    View Details <ArrowRight size={15} />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center" }}
        >
          <Link href="/rooms">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "#C9A84C",
                color: "#0A0F1E",
                border: "none",
                padding: "0.9rem 2.5rem",
                borderRadius: "0.5rem",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
              }}
            >
              View All Rooms <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
