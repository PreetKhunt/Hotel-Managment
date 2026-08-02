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

// ─── Housekeeping Types ───────────────────────────────────────────────────────
export type HousekeepingStatus = 'Pending' | 'In Progress' | 'Completed' | 'Verified' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface HousekeepingTask {
  id: string;
  room_id: string;
  room_number?: string;
  room_name?: string;
  assigned_to?: string | null;
  assigned_name?: string;
  assigned_by?: string | null;
  status: HousekeepingStatus;
  priority: TaskPriority;
  remarks?: string;
  started_at?: string | null;
  completed_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CleaningHistoryRecord {
  id: string;
  task_id: string;
  room_id: string;
  room_number?: string;
  room_name?: string;
  assigned_by?: string | null;
  completed_by: string;
  staff_name?: string;
  time_taken_minutes: number;
  completed_at: string;
  remarks?: string;
  created_by?: string | null;
  created_at: string;
}

// ─── Maintenance Types ────────────────────────────────────────────────────────
export type MaintenanceStatus = 'Reported' | 'Assigned' | 'In Progress' | 'On Hold' | 'Completed' | 'Verified' | 'Cancelled';
export type IssueType = 'Plumbing' | 'Electrical' | 'HVAC' | 'Furniture' | 'Appliance' | 'Structural' | 'Technology' | 'Other';

export interface MaintenanceRequest {
  id: string;
  room_id: string;
  room_number?: string;
  room_name?: string;
  reported_by: string;
  reporter_name?: string;
  assigned_to?: string | null;
  technician_name?: string;
  status: MaintenanceStatus;
  priority: TaskPriority;
  issue_type: IssueType;
  description: string;
  estimated_cost: number;
  actual_cost: number;
  started_at?: string | null;
  completed_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceAuditLog {
  id: string;
  request_id: string;
  action_type: string;
  old_status?: string | null;
  new_status?: string | null;
  performed_by: string;
  performer_email?: string;
  assigned_technician_id?: string | null;
  technician_name?: string;
  cost_delta?: number | null;
  notes?: string;
  created_at: string;
}

// ─── System Notification Types ────────────────────────────────────────────────
export interface SystemNotification {
  id: string;
  role_target?: string | null;
  user_target?: string | null;
  title: string;
  message: string;
  priority: 'Info' | 'Warning' | 'Critical';
  link?: string | null;
  is_read: boolean;
  created_by?: string | null;
  created_at: string;
}

