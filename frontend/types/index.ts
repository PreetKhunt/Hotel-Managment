// ─── Room Types ───────────────────────────────────────────────────────────────
export type RoomType = "standard" | "deluxe" | "suite" | "presidential";
export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved";

export interface RoomAmenity {
  icon: string;
  label: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  size: number; // in sqft
  maxGuests: number;
  bedType: string;
  floor: number;
  description: string;
  longDescription: string;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
}

// ─── Booking Types ────────────────────────────────────────────────────────────
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "checked-in" | "checked-out";

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomName: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
}

// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole = "guest" | "receptionist" | "manager" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  joinedAt: string;
  status: "active" | "inactive";
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────
export interface StatsData {
  label: string;
  value: number | string;
  change: number;
  changeType: "increase" | "decrease";
  icon: string;
}

export interface ChartDataPoint {
  name: string;
  bookings?: number;
  revenue?: number;
  occupancy?: number;
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  title: string;
  comment: string;
  stayType: string;
  roomType: string;
  country: string;
  date: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export interface ServiceFAQ {
  question: string;
  answer: string;
}
