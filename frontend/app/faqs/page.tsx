"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const faqs = [
  // Booking & Reservations
  {
    category: "Booking & Reservations",
    question: "How can I make a reservation?",
    answer: "Reservations can be made directly through our website by navigating to the 'Our Rooms' section, selecting your dates, and choosing your preferred room type. You can also contact our reservation team via phone or email for personalized assistance."
  },
  {
    category: "Booking & Reservations",
    question: "Do I need a credit card to guarantee my reservation?",
    answer: "Yes, a valid credit card is required to guarantee all reservations. However, your card will only be charged according to the specific cancellation policy of the rate you booked."
  },
  {
    category: "Booking & Reservations",
    question: "Can I modify my booking after it has been confirmed?",
    answer: "Yes, modifications can be made through the Guest Dashboard if booked directly via our website, subject to availability and the terms of your booking rate. For third-party bookings, please contact your booking provider."
  },
  
  // Check-in & Check-out
  {
    category: "Check-in & Check-out",
    question: "What are the standard check-in and check-out times?",
    answer: "Our standard check-in time is 3:00 PM, and check-out is at 12:00 PM (noon). Early check-in and late check-out are subject to availability and may incur additional charges."
  },
  {
    category: "Check-in & Check-out",
    question: "Is early check-in or late check-out available?",
    answer: "Yes, we offer both early check-in and late check-out upon request. Please contact the front desk in advance. These requests are subject to room availability and a potential surcharge."
  },
  {
    category: "Check-in & Check-out",
    question: "What documents do I need for check-in?",
    answer: "Guests must present a valid government-issued photo ID (such as a passport or driver's license) and the credit card used for the booking. International guests must present a valid passport."
  },

  // Payments & Refunds
  {
    category: "Payments & Refunds",
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards including Visa, MasterCard, American Express, and Discover. We also accept digital payments like Apple Pay, Google Pay, and UPI via Razorpay."
  },
  {
    category: "Payments & Refunds",
    question: "Is a security deposit required upon check-in?",
    answer: "Yes, a pre-authorization holds on your credit card will be required at check-in for the total room rate plus an incidental hold per night. This hold is released upon check-out."
  },
  {
    category: "Payments & Refunds",
    question: "How long do refunds take to process?",
    answer: "Refunds for cancelled bookings (if eligible) are processed immediately from our end. However, it may take 5-10 business days for the funds to reflect in your bank account depending on your card issuer."
  },

  // Room Policies
  {
    category: "Room Policies",
    question: "Is smoking permitted in the rooms?",
    answer: "Hospitality Hub is a 100% smoke-free property. Smoking in any room or indoor public area is strictly prohibited. A deep-cleaning fee will be charged for violations. Designated outdoor smoking areas are available."
  },
  {
    category: "Room Policies",
    question: "Can I request an extra bed or crib?",
    answer: "Yes, rollaway beds and cribs are available upon request for select room categories. A nightly fee applies for rollaway beds, while cribs are provided complimentary. Please request these prior to arrival."
  },
  {
    category: "Room Policies",
    question: "Are pets allowed?",
    answer: "We are a pet-friendly hotel! We welcome dogs and cats up to 40 lbs. A non-refundable pet fee per stay applies. Please inform us at the time of booking so we can prepare pet amenities for your room."
  },

  // Restaurant
  {
    category: "Restaurant",
    question: "What are the restaurant operating hours?",
    answer: "Our signature restaurant is open for Breakfast from 6:30 AM to 10:30 AM, Lunch from 12:00 PM to 3:00 PM, and Dinner from 6:00 PM to 11:00 PM. In-room dining is available 24/7."
  },
  {
    category: "Restaurant",
    question: "Do you cater to specific dietary requirements?",
    answer: "Absolutely. Our culinary team is highly trained in accommodating dietary restrictions including vegan, gluten-free, halal, and severe allergies. Please inform your server or mention it during booking."
  },
  {
    category: "Restaurant",
    question: "Is a reservation required for the restaurant?",
    answer: "While we welcome walk-ins, we highly recommend making a dining reservation in advance, especially for dinner and weekend brunches, as our restaurants frequently reach capacity."
  },

  // Spa & Fitness
  {
    category: "Spa & Fitness",
    question: "Do I need to book spa treatments in advance?",
    answer: "Yes, we strongly recommend booking your spa treatments at least 48 hours in advance to secure your preferred time and therapist. Walk-in appointments are subject to availability."
  },
  {
    category: "Spa & Fitness",
    question: "What are the opening hours of the Elite Fitness Centre?",
    answer: "The Elite Fitness Centre is open 24 hours a day for all in-house guests. A room key is required for access outside of staffed hours (6:00 AM to 10:00 PM)."
  },

  // Cancellation
  {
    category: "Cancellation",
    question: "What is your standard cancellation policy?",
    answer: "Standard rates allow free cancellation up to 48 hours before the check-in date. Cancellations made within 48 hours will incur a penalty equal to one night's room rate and taxes."
  },
  {
    category: "Cancellation",
    question: "Are Advance Purchase or Non-Refundable rates flexible?",
    answer: "No, reservations booked under Non-Refundable or Advance Purchase rates require full prepayment and cannot be cancelled, modified, or refunded under any circumstances."
  },

  // Security & General
  {
    category: "Security",
    question: "Does the hotel have parking facilities?",
    answer: "Yes, we offer secure, 24/7 underground valet parking and self-parking for all guests. An overnight parking fee applies. EV charging stations are also available on-site."
  },
  {
    category: "General Information",
    question: "Do you offer airport transfer services?",
    answer: "Yes, we offer luxury airport chauffeur services in our fleet of premium vehicles. Please contact our concierge desk at least 24 hours in advance to arrange your pickup or drop-off."
  },
  {
    category: "General Information",
    question: "Is high-speed Wi-Fi available?",
    answer: "Complimentary high-speed Wi-Fi is available in all guest rooms, meeting spaces, and public areas. Premium high-tier bandwidth is available for an additional daily fee or included in premium suites."
  }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

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
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C" }}>
                <HelpCircle size={32} />
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
              Frequently Asked Questions
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
              Find answers to common questions about reservations, hotel policies, amenities, and more. Our dedicated support team is also available 24/7 to assist you.
            </p>

            {/* Search Bar */}
            <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto" }}>
              <div style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", color: "#64748B" }}>
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "1.2rem 1.5rem 1.2rem 3.5rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "99px",
                  color: "#F8FAFC",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#C9A84C"}
                onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
              />
            </div>
          </motion.div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
          
          {/* Content Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Categories */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
              <button
                onClick={() => setActiveCategory("All")}
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "99px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 0.3s",
                  background: activeCategory === "All" ? "#C9A84C" : "rgba(255,255,255,0.05)",
                  color: activeCategory === "All" ? "#060B16" : "#CBD5E1",
                  border: `1px solid ${activeCategory === "All" ? "#C9A84C" : "rgba(201,168,76,0.2)"}`,
                  cursor: "pointer",
                }}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    padding: "0.6rem 1.2rem",
                    borderRadius: "99px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    transition: "all 0.3s",
                    background: activeCategory === category ? "#C9A84C" : "rgba(255,255,255,0.05)",
                    color: activeCategory === category ? "#060B16" : "#CBD5E1",
                    border: `1px solid ${activeCategory === category ? "#C9A84C" : "rgba(201,168,76,0.2)"}`,
                    cursor: "pointer",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
              {filteredFaqs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748B" }}>
                  <Search size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                  <p style={{ fontSize: "1.2rem" }}>No FAQs found matching your criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                    style={{ marginTop: "1rem", color: "#C9A84C", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          background: "rgba(26,34,53,0.4)",
                          border: "1px solid rgba(201,168,76,0.15)",
                          borderRadius: "1rem",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          style={{
                            width: "100%",
                            padding: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "transparent",
                            border: "none",
                            color: "#F8FAFC",
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "1.05rem",
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ paddingRight: "2rem" }}>{faq.question}</span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ color: "#C9A84C", flexShrink: 0 }}
                          >
                            <ChevronDown size={20} />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div style={{ padding: "0 1.5rem 1.5rem", color: "#94A3B8", lineHeight: 1.7 }}>
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
