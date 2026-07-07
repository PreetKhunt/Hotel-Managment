import { z } from 'zod';

export const updateRoomStatusSchema = z.object({
  body: z.object({
    status: z.enum(['available', 'reserved', 'occupied', 'cleaning', 'maintenance', 'blocked', 'out_of_service']),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'pending_payment', 'payment_failed', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'expired', 'refunded', 'no_show']),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    roleId: z.string().uuid(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'inactive', 'suspended', 'deleted']),
  }),
});

export const updateHotelSettingsSchema = z.object({
  body: z.object({
    hotel_name: z.string().min(1).optional(),
    description: z.string().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    gst_percentage: z.number().min(0).max(100).optional(),
    check_in_time: z.string().optional(),
    check_out_time: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    support_email: z.string().email().optional(),
    support_phone: z.string().optional(),
    cancellation_policy: z.string().optional(),
  }),
});
