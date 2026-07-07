export type UserRole = 'Guest' | 'Receptionist' | 'Manager' | 'Admin' | 'Super Admin';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: {
    name: UserRole;
    permissions: string[];
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
