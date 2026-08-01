import { FilterState } from '@/components/rooms/FilterSidebar';

export type StayPurpose = 'Business' | 'Leisure' | 'Family Vacation' | 'Honeymoon' | 'Friends' | 'Solo';
export type BudgetRange = '2000-3000' | '3000-5000' | '5000+';
export type GuestCount = 1 | 2 | 3 | 4; // 4 means 4+
export type BedPreference = 'Single' | 'Double' | 'King' | 'Twin' | 'No Preference';

export interface StayMatchPreferences {
  purpose?: StayPurpose;
  budget?: BudgetRange;
  guests?: GuestCount;
  bedType?: BedPreference;
  amenities: string[];
  environment: string[];
}

export type BadgeVariant = 'budget' | 'purpose' | 'family' | 'bed' | 'view' | 'luxury' | 'amenity' | 'default';

export interface RoomBadge {
  id: string;
  label: string;
  icon: string;
  variant: BadgeVariant;
  color?: string;
  bgColor?: string;
}

export interface QuestionOption<T = string> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
}

export type QuestionInputType = 'single-card' | 'number-selector' | 'checkbox-grid';

export interface QuestionConfig {
  id: keyof StayMatchPreferences;
  step: number;
  title: string;
  subtitle: string;
  type: QuestionInputType;
  required: boolean;
  options: QuestionOption<unknown>[];
}

export interface StayMatchResult {
  matchingRooms: string[]; // room IDs
  mappedFilters: FilterState;
}
