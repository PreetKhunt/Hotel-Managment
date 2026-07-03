export enum HotelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface Hotel {
  id: string;
  name: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  gstNumber: string | null;
  timezone: string;
  currency: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  logoUrl: string | null;
  status: HotelStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface HotelSettings {
  id: string;
  hotelId: string;
  hotelName: string;
  currency: string;
  timezone: string;
  gstPercentage: number;
  checkInTime: string;
  checkOutTime: string;
  maximumBookingDays: number;
  freeCancellationHours: number;
  invoicePrefix: string;
  bookingPrefix: string;
  supportEmail: string | null;
  supportPhone: string | null;
  logoUrl: string | null;
  featureFlags: FeatureFlags;
  createdAt?: Date;
  updatedAt?: Date;
}
