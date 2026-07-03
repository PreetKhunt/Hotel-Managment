export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted',
}

export interface User {
  id: string; // UUID from Supabase auth.users
  email: string;
  roleId: string | null;
  status: UserStatus;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null; // DATE string
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  lastLoginAt: Date | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
