"use client";
import { motion } from "framer-motion";
import { ShieldAlert, CalendarX2, CreditCard, Clock, Info, Phone } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

const policies = [
  {
    title: "Standard Cancellation (Free Cancellation)",
    icon: <CalendarX2 size={24} />,
    content: "For most standard rate reservations, guests may cancel free of charge up to 48 hours prior to the scheduled check-in time (3:00 PM local hotel time). If cancelled within the allowed window, no penalty will be charged, and any pre-authorization or deposit will be released."
  },
  {
    title: "Late Cancellation Policy",
    icon: <Clock size={24} />,
    content: "Cancellations made within 48 hours of the scheduled arrival date will incur a late cancellation penalty equal to the first night's room rate plus applicable taxes. This amount will be charged to the credit card on file used to guarantee the reservation."
  },
  {
    title: "Non-Refundable & Advance Purchase Rates",
    icon: <ShieldAlert size={24} />,
    content: "Reservations booked under 'Advance Purchase', 'Non-Refundable', or special promotional rates require full prepayment at the time of booking. These reservations cannot be modified, cancelled, or refunded under any circumstances."
  },
  {
    title: "No-Show Policy",
    icon: <Info size={24} />,
    content: "If a guest fails to arrive on the scheduled check-in date without prior notification (No-Show), the reservation will be cancelled. The guest will be charged a penalty equal to 100% of the total booking cost, and the remaining nights will be released."
  },
  {
    title: "Early Check-Out",
    icon: <Clock size={24} />,
    content: "If you decide to check out prior to your scheduled departure date, an early departure fee equal to one night's room rate and tax will apply, unless your reservation was booked under a non-refundable rate, which requires full payment for the entire stay."
  },
  {
    title: "Refund Processing Timeline",
    icon: <CreditCard size={24} />,
    content: "Eligible refunds are processed by the hotel within 24 hours of cancellation. However, it may take 5-10 business days for the funds to reflect in your account, depending entirely on your bank or credit card issuer's processing times."
  },
  {
    title: "Force Majeure",
    icon: <ShieldAlert size={24} />,
    content: "In the event of a documented emergency, natural disaster, government travel restriction, or global pandemic that legally prevents you from traveling, we offer flexibility to reschedule your dates without penalty or receive hotel credit, subject to management approval."
  },
  {
    title: "Group & Event Bookings",
    icon: <Info size={24} />,
    content: "Cancellations for group bookings (5 or more rooms) or special event spaces are subject to the specific terms outlined in the group contract, which generally require a minimum of 30 days notice for full deposit refunds."
  }
];

export default function CancellationPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#060B16" }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: "80px" }}>
        {/* Hero Section */}
        <div
          style={{
            position: "relative",
            padding: "5rem 2rem",
            background: "linear-gradient(to bottom, #0A0F1E, #060B16)",
            textAlign: "center",
            borderBottom: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C" }}>
                <ShieldAlert size={32} />
              </div>
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "3.5rem",
                fontWeight: 700,
                color: "#F8FAFC",
                marginBottom: "1.5rem",
              }}
            >
              Cancellation Policy
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "1.1rem", lineHeight: 1.6 }}>
              We understand that plans can change. Review our comprehensive cancellation terms and refund guidelines below to ensure a smooth experience.
            </p>
          </motion.div>
        </div>

        {/* Content Section */}
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "4rem 2rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  background: "rgba(26,34,53,0.5)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: "1rem",
                  padding: "2rem",
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ 
                  background: "rgba(201,168,76,0.1)", 
                  color: "#C9A84C", 
                  padding: "1rem", 
                  borderRadius: "0.75rem",
                  flexShrink: 0
                }}>
                  {policy.icon}
                </div>
                <div>
                  <h3 style={{ 
                    color: "#F8FAFC", 
                    fontSize: "1.25rem", 
                    fontWeight: 600, 
                    marginBottom: "0.75rem" 
                  }}>
                    {policy.title}
                  </h3>
                  <p style={{ 
                    color: "#94A3B8", 
                    lineHeight: 1.7, 
                    fontSize: "0.95rem",
                    margin: 0
                  }}>
                    {policy.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              marginTop: "4rem",
              background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.02) 100%)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "1rem",
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#F8FAFC", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
              Need to modify or cancel your booking?
            </h3>
            <p style={{ color: "#94A3B8", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
              If you booked directly through our website, you can manage your reservation in your Dashboard. For immediate assistance, our reservation team is available 24/7.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/dashboard"
                style={{
                  padding: "0.8rem 2rem",
                  background: "#C9A84C",
                  color: "#060B16",
                  fontWeight: 600,
                  borderRadius: "0.5rem",
                  transition: "opacity 0.2s",
                }}
              >
                Manage Booking
              </Link>
              <a
                href="tel:+919974295118"
                style={{
                  padding: "0.8rem 2rem",
                  background: "transparent",
                  color: "#C9A84C",
                  fontWeight: 600,
                  borderRadius: "0.5rem",
                  border: "1px solid #C9A84C",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Phone size={18} />
                Contact Reception
              </a>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
