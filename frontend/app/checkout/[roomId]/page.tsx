"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useRoom } from "@/hooks/useRooms";

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const BG   = '#0A0F1E';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';
const BG_DARK = '#0D1526';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.roomId as string;
  const { user, isLoading: userLoading } = useAuth();
  const { data: room, isLoading: roomLoading, isError: roomError } = useRoom(roomId);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{ bookingId: string, orderId: string, grandTotal: number } | null>(null);

  // Form State extracted from URL
  const checkIn = searchParams?.get("checkIn") || "";
  const checkOut = searchParams?.get("checkOut") || "";
  const guests = parseInt(searchParams?.get("guests") || "1", 10);
  const specialRequests = searchParams?.get("specialRequests") || "";

  useEffect(() => {
    if (!userLoading && !user) {
      toast.error("Please login to complete your booking");
      const qs = new URLSearchParams({
        checkIn, checkOut, guests: guests.toString(), specialRequests
      }).toString();
      // Redirect to login and save the redirect URL
      router.push(`/login?next=${encodeURIComponent(`/checkout/${roomId}?${qs}`)}`);
    }
  }, [user, userLoading, router, checkIn, checkOut, guests, specialRequests, roomId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const calcNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 0;
    const diff = Math.round((new Date(outDate).getTime() - new Date(inDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calcNights(checkIn, checkOut);
  const subtotal = room ? room.pricePerNight * nights : 0;
  const taxRate = 0.12;
  const taxes = Math.round(subtotal * taxRate);
  const total = subtotal + taxes;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your connection.");
        return;
      }

      let bookingId: string, orderId: string, grandTotal: number;

      if (pendingBooking) {
        // Reuse existing pending booking to avoid duplicates
        bookingId = pendingBooking.bookingId;
        orderId = pendingBooking.orderId;
        grandTotal = pendingBooking.grandTotal;
      } else {
        // 1. Create Booking
        const bookingRes = await api.post("/bookings", {
          roomId,
          checkIn,
          checkOut,
          guests,
          specialRequests
        });

        const bookingData = bookingRes.data;
        if (!bookingData.success) throw new Error(bookingData.message);

        bookingId = bookingData.data.bookingId;
        orderId = bookingData.data.razorpayOrderId;
        grandTotal = bookingData.data.grandTotal;

        setPendingBooking({ bookingId, orderId, grandTotal });
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        name: "Hospitality Hub",
        description: `Booking for ${room?.name}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            setLoading(true); // Re-enable loading during verification
            // 3. Verify Payment
            const verifyRes = await api.post("/bookings/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            
            if (verifyRes.data.success) {
              setSubmitted(true);
              setPendingBooking(null);
              toast.success("Payment successful!");
              router.push(`/dashboard/bookings/${bookingId}?success=true`);
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed");
              setLoading(false);
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Payment verification error");
            setLoading(false);
          }
        },
        prefill: {
          name: user ? `${user.first_name} ${user.last_name}` : "",
          email: user?.email || "",
          contact: ""
        },
        theme: {
          color: GOLD
        },
        modal: {
          ondismiss: function() {
            toast.error(
              (t) => (
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Payment Cancelled</strong>
                  <span style={{ fontSize: '0.9rem' }}>
                    Your payment was cancelled. No amount has been charged. You can try again whenever you're ready.
                  </span>
                </div>
              ),
              { duration: 5000 }
            );
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        toast.error(
          (t) => (
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Payment Failed</strong>
              <span style={{ fontSize: '0.9rem' }}>
                {response.error.description || "An error occurred with your payment. Please try again."}
              </span>
            </div>
          ),
          { duration: 5000 }
        );
      });
      paymentObject.open();
    } catch (error: any) {
      toast.error(error.message || "An error occurred while initializing payment.");
    } finally {
      // Set loading to false so the user can click 'Pay Again'
      setLoading(false);
    }
  };

  if (roomLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG, color: SECONDARY }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: GOLD }} />
          <p>Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG, color: SECONDARY }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: TEXT }}>Booking Error</h2>
          <p className="mb-6">Unable to load booking details.</p>
          <Link href="/rooms" className="px-6 py-3 rounded-lg" style={{ background: GOLD, color: BG }}>
            Return to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <div style={{
        background: `linear-gradient(135deg, ${BG} 0%, ${BG_DARK} 100%)`,
        borderBottom: `1px solid rgba(201,168,76,0.1)`,
        padding: "30px 24px"
      }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href={`/rooms/${roomId}`} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: SECONDARY }}>
            <ArrowLeft className="w-4 h-4" /> Back to Room
          </Link>
          <div className="flex items-center gap-2" style={{ color: GOLD }}>
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-widest uppercase">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 mt-8">
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* LEFT: Booking Summary */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold font-playfair mb-6">Review your booking</h2>
            
            <div style={{ background: CARD_BG, borderRadius: "20px", border: "1px solid rgba(201,168,76,0.15)", overflow: "hidden" }}>
              <div className="flex gap-4 p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <img src={room.images[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"} 
                     alt={room.name} className="w-24 h-24 object-cover rounded-xl" />
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: GOLD }}>{room.name}</h3>
                  <div className="text-sm" style={{ color: SECONDARY }}>{room.type} Room • {room.bedType}</div>
                  <div className="mt-2 text-sm font-semibold">₹{room.pricePerNight.toLocaleString()} / night</div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div>
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: SECONDARY }}>Check-in</div>
                    <div className="font-semibold">{new Date(checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="text-xs mt-1" style={{ color: SECONDARY }}>From 3:00 PM</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: SECONDARY }}>Check-out</div>
                    <div className="font-semibold">{new Date(checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="text-xs mt-1" style={{ color: SECONDARY }}>Until 11:00 AM</div>
                  </div>
                </div>
                
                <div className="flex justify-between pb-2">
                  <span style={{ color: SECONDARY }}>Length of stay</span>
                  <span className="font-semibold">{nights} nights</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span style={{ color: SECONDARY }}>Guests</span>
                  <span className="font-semibold">{guests} adults</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* RIGHT: Price & Payment */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: CARD_BG, borderRadius: "20px", border: "1px solid rgba(201,168,76,0.15)", padding: "30px" }}>
              <h2 className="text-xl font-bold mb-6">Price Details</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span style={{ color: SECONDARY }}>₹{room.pricePerNight.toLocaleString()} × {nights} nights</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <span style={{ color: SECONDARY }}>Taxes and fees</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2">
                  <span>Total (INR)</span>
                  <span style={{ color: GOLD }}>₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex gap-3 text-emerald-400">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p className="text-xs leading-relaxed">
                    <strong>Payment is safe and secure.</strong> All payments are processed through Razorpay's PCI-DSS compliant secure servers.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handlePayment}
                disabled={loading || nights <= 0 || submitted}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #A07A2E)`, color: BG }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {loading ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
              </button>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
