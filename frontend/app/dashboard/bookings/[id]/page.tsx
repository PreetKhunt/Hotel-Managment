"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User, CreditCard, Clock, Download, X } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import StatusBadge from "@/components/shared/StatusBadge";
import toast from "react-hot-toast";

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const BG = '#0A0F1E';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';

export default function BookingDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bookingId = params?.id as string;
  const isSuccess = searchParams?.get("success") === "true";

  const [cancelling, setCancelling] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const res = await api.get(`/bookings/${bookingId}`);
      return res.data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Booking cancelled successfully!");
        queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      } else {
        toast.error(data.message || "Failed to cancel booking");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error cancelling booking");
    },
    onSettled: () => {
      setCancelling(false);
    }
  });

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      setCancelling(true);
      cancelMutation.mutate();
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}/invoice`);
      const data = res.data;
      if (data.success && data.data.invoiceUrl) {
        window.open(data.data.invoiceUrl, "_blank");
      } else {
        toast.error("Invoice not available yet.");
      }
    } catch (err) {
      toast.error("Error fetching invoice.");
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center" style={{ color: GOLD }}>Loading booking details...</div>;
  }

  if (isError || !booking) {
    return <div className="p-10 text-center text-red-500">Failed to load booking.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/bookings" className="flex items-center gap-2 text-sm hover:text-white" style={{ color: SECONDARY }}>
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>

      {isSuccess && (
        <div className="p-4 rounded-xl mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          🎉 Payment successful! Your booking is confirmed.
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair mb-1">Booking #{booking.booking_reference || booking.id.substring(0,8)}</h1>
          <div className="text-sm" style={{ color: SECONDARY }}>
            Placed on {new Date(booking.created_at).toLocaleString()}
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {/* Left Column: Room & Dates */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(201,168,76,0.1)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
              <Calendar className="w-5 h-5" /> Stay Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: SECONDARY }}>Check-in</div>
                <div className="font-semibold">{new Date(booking.check_in).toLocaleDateString()}</div>
                <div className="text-sm mt-1" style={{ color: SECONDARY }}>From 3:00 PM</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: SECONDARY }}>Check-out</div>
                <div className="font-semibold">{new Date(booking.check_out).toLocaleDateString()}</div>
                <div className="text-sm mt-1" style={{ color: SECONDARY }}>Until 11:00 AM</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.05)' }}>
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
              <User className="w-5 h-5" /> Guest Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: SECONDARY }}>Guests</span>
                <span className="font-semibold">{booking.guests || 1} Adult(s)</span>
              </div>
              {booking.special_requests && (
                <div className="pt-3 border-t border-white/10">
                  <span className="block mb-1" style={{ color: SECONDARY }}>Special Requests</span>
                  <span>{booking.special_requests}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.05)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
              <CreditCard className="w-5 h-5" /> Payment Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10 mt-2">
                <span>Total</span>
                <span style={{ color: GOLD }}>INR {parseFloat(booking.grand_total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {(booking.status === 'confirmed' || booking.status === 'completed') && (
              <button
                onClick={handleDownloadInvoice}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-white/10 transition-colors hover:bg-white/5"
              >
                <Download className="w-4 h-4" /> Download Invoice
              </button>
            )}

            {(booking.status === 'confirmed' || booking.status === 'pending_payment') && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-red-500/20 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                <X className="w-4 h-4" /> {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
