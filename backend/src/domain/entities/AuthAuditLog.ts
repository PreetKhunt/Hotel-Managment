export interface AuthAuditLog {
  id: string; // UUID
  userId: string | null; // Nullable if the action failed before user could be resolved, or if user was deleted
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  createdAt: Date;
}
