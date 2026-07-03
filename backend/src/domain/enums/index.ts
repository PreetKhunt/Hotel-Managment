export enum BookingStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_FAILED = 'payment_failed',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  CREATED = 'created',
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  VOIDED = 'voided',
}

// Allowed state transitions for BookingStatus
export const BookingTransitions: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.DRAFT]: [BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELLED],
  [BookingStatus.PENDING_PAYMENT]: [BookingStatus.CONFIRMED, BookingStatus.PAYMENT_FAILED, BookingStatus.EXPIRED, BookingStatus.CANCELLED],
  [BookingStatus.PAYMENT_FAILED]: [BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.CHECKED_IN, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
  [BookingStatus.CHECKED_IN]: [BookingStatus.CHECKED_OUT],
  [BookingStatus.CHECKED_OUT]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [BookingStatus.REFUNDED],
  [BookingStatus.EXPIRED]: [],
  [BookingStatus.REFUNDED]: [],
  [BookingStatus.NO_SHOW]: [],
};
