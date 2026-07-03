import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: number;
}

export default function StarRating({ value, size = 16 }: StarRatingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          style={{
            color: "#C9A84C",
            fill: i <= Math.round(value) ? "#C9A84C" : "transparent",
            strokeWidth: 1.5,
          }}
        />
      ))}
    </div>
  );
}
