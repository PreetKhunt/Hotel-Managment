import { BookingStatus, RoomStatus } from "@/types";

type Status = BookingStatus | RoomStatus | string;

const config: Record<
  string,
  { bg: string; color: string; border: string; label: string }
> = {
  confirmed: {
    bg: "rgba(16,185,129,0.15)",
    color: "#10B981",
    border: "rgba(16,185,129,0.3)",
    label: "Confirmed",
  },
  pending: {
    bg: "rgba(245,158,11,0.15)",
    color: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
    label: "Pending",
  },
  cancelled: {
    bg: "rgba(239,68,68,0.15)",
    color: "#EF4444",
    border: "rgba(239,68,68,0.3)",
    label: "Cancelled",
  },
  "checked-in": {
    bg: "rgba(59,130,246,0.15)",
    color: "#3B82F6",
    border: "rgba(59,130,246,0.3)",
    label: "Checked In",
  },
  "checked-out": {
    bg: "rgba(148,163,184,0.15)",
    color: "#94A3B8",
    border: "rgba(148,163,184,0.3)",
    label: "Checked Out",
  },
  available: {
    bg: "rgba(201,168,76,0.15)",
    color: "#C9A84C",
    border: "rgba(201,168,76,0.3)",
    label: "Available",
  },
  occupied: {
    bg: "rgba(239,68,68,0.15)",
    color: "#EF4444",
    border: "rgba(239,68,68,0.3)",
    label: "Occupied",
  },
  maintenance: {
    bg: "rgba(245,158,11,0.15)",
    color: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
    label: "Maintenance",
  },
  reserved: {
    bg: "rgba(139,92,246,0.15)",
    color: "#8B5CF6",
    border: "rgba(139,92,246,0.3)",
    label: "Reserved",
  },
  active: {
    bg: "rgba(16,185,129,0.15)",
    color: "#10B981",
    border: "rgba(16,185,129,0.3)",
    label: "Active",
  },
  inactive: {
    bg: "rgba(148,163,184,0.15)",
    color: "#94A3B8",
    border: "rgba(148,163,184,0.3)",
    label: "Inactive",
  },
  clean: {
    bg: "rgba(16,185,129,0.15)",
    color: "#10B981",
    border: "rgba(16,185,129,0.3)",
    label: "Clean",
  },
  dirty: {
    bg: "rgba(239,68,68,0.15)",
    color: "#EF4444",
    border: "rgba(239,68,68,0.3)",
    label: "Dirty",
  },
  "under cleaning": {
    bg: "rgba(59,130,246,0.15)",
    color: "#3B82F6",
    border: "rgba(59,130,246,0.3)",
    label: "Under Cleaning",
  },
  "in progress": {
    bg: "rgba(59,130,246,0.15)",
    color: "#3B82F6",
    border: "rgba(59,130,246,0.3)",
    label: "In Progress",
  },
  completed: {
    bg: "rgba(16,185,129,0.15)",
    color: "#10B981",
    border: "rgba(16,185,129,0.3)",
    label: "Completed",
  },
  verified: {
    bg: "rgba(201,168,76,0.18)",
    color: "#C9A84C",
    border: "rgba(201,168,76,0.4)",
    label: "Verified",
  },
  reported: {
    bg: "rgba(245,158,11,0.15)",
    color: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
    label: "Reported",
  },
  assigned: {
    bg: "rgba(139,92,246,0.15)",
    color: "#8B5CF6",
    border: "rgba(139,92,246,0.3)",
    label: "Assigned",
  },
  "on hold": {
    bg: "rgba(249,115,22,0.15)",
    color: "#F97316",
    border: "rgba(249,115,22,0.3)",
    label: "On Hold",
  },
  emergency: {
    bg: "rgba(239,68,68,0.22)",
    color: "#f87171",
    border: "rgba(239,68,68,0.5)",
    label: "Emergency",
  },
  high: {
    bg: "rgba(249,115,22,0.18)",
    color: "#fb923c",
    border: "rgba(249,115,22,0.4)",
    label: "High",
  },
  medium: {
    bg: "rgba(245,158,11,0.15)",
    color: "#fbbf24",
    border: "rgba(245,158,11,0.3)",
    label: "Medium",
  },
  low: {
    bg: "rgba(148,163,184,0.15)",
    color: "#94A3B8",
    border: "rgba(148,163,184,0.3)",
    label: "Low",
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const normalized = (status || '').toString().toLowerCase();
  const s = config[normalized] ?? config["pending"];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: "0.2rem 0.75rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        display: "inline-block",
        letterSpacing: "0.03em",
      }}
    >
      {s.label}
    </span>
  );
}
