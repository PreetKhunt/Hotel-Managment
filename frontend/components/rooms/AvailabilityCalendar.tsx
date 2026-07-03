"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAvailabilityCalendar } from "@/hooks/useAvailability";

const GOLD = "#C9A84C";
const BG_DARK = "#0D1526";
const SECONDARY = "#94A3B8";

interface AvailabilityCalendarProps {
  roomId: string;
}

export default function AvailabilityCalendar({ roomId }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load from first day of month to last day of next month to cover a decent view
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

  const { data: availability = [], isLoading } = useAvailabilityCalendar(roomId, startDate, endDate);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const renderDays = () => {
    const days = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // Blanks before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split("T")[0];
      const isPast = dateStr < todayStr;
      
      const dayData = availability.find((d) => d.date === dateStr);
      const isAvailable = !isPast && (dayData ? dayData.isAvailable : true); // Assume true if not found/error
      const priceModifier = dayData?.priceModifier || 0;
      
      let bg = "transparent";
      let color = SECONDARY;
      let border = "1px solid rgba(148,163,184,0.1)";

      if (isPast) {
        color = "rgba(148,163,184,0.3)";
      } else if (!isAvailable) {
        bg = "rgba(239,68,68,0.05)";
        color = "#F87171"; // Red
        border = "1px solid rgba(239,68,68,0.2)";
      } else {
        bg = "rgba(16,185,129,0.05)";
        color = "#34D399"; // Green
        border = "1px solid rgba(16,185,129,0.2)";
      }

      days.push(
        <div
          key={i}
          style={{
            background: bg,
            color,
            border,
          }}
          className="relative rounded-lg p-2 flex flex-col items-center justify-center min-h-[60px]"
        >
          <span className="font-semibold text-sm">{i}</span>
          {!isPast && isAvailable && priceModifier > 0 && (
             <span style={{ color: GOLD, fontSize: '10px', marginTop: '2px' }}>+${priceModifier}</span>
          )}
          {!isPast && isAvailable && priceModifier < 0 && (
             <span style={{ color: "#34D399", fontSize: '10px', marginTop: '2px' }}>-${Math.abs(priceModifier)}</span>
          )}
          {!isPast && !isAvailable && (
             <span style={{ fontSize: '10px', marginTop: '2px' }}>Booked</span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div
      style={{
        background: BG_DARK,
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(201,168,76,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: 700,
            color: GOLD,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Availability Calendar
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            style={{
              background: "rgba(148,163,184,0.1)",
              border: "1px solid rgba(148,163,184,0.2)",
              color: SECONDARY,
            }}
            className="p-1 rounded cursor-pointer hover:text-white"
          >
            ←
          </button>
          <span style={{ color: "#F8FAFC", fontWeight: 600, width: "100px", textAlign: "center" }}>
            {monthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            style={{
              background: "rgba(148,163,184,0.1)",
              border: "1px solid rgba(148,163,184,0.2)",
              color: SECONDARY,
            }}
            className="p-1 rounded cursor-pointer hover:text-white"
          >
            →
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center" style={{ color: SECONDARY }}>
          Loading calendar...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 mb-2 text-center" style={{ color: SECONDARY, fontSize: "11px", fontWeight: 600 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
        </>
      )}
    </div>
  );
}
