// BookingStatus, PaymentStatus are not strictly required here yet

export interface BaseEvent {
  eventId: string;
  timestamp: Date;
  correlationId: string;
}

export interface BookingCreatedEvent extends BaseEvent {
  type: 'BookingCreated';
  payload: {
    bookingId: string;
    bookingReference: string;
    userId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    grandTotal: number;
  };
}

export interface BookingConfirmedEvent extends BaseEvent {
  type: 'BookingConfirmed';
  payload: {
    bookingId: string;
    bookingReference: string;
    paymentId: string;
    roomId: string;
  };
}

export interface PaymentSuccessfulEvent extends BaseEvent {
  type: 'PaymentSuccessful';
  payload: {
    paymentId: string;
    bookingId: string;
    razorpayPaymentId: string;
    amount: number;
  };
}

export interface InvoiceGeneratedEvent extends BaseEvent {
  type: 'InvoiceGenerated';
  payload: {
    bookingId: string;
    invoiceId: string;
    invoiceNumber: string;
    invoiceUrl: string;
  };
}

export type DomainEvent = 
  | BookingCreatedEvent 
  | BookingConfirmedEvent 
  | PaymentSuccessfulEvent
  | InvoiceGeneratedEvent;
