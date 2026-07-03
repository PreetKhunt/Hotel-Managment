export interface Role {
  id: string; // UUID
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}
