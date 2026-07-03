"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, Database, Globe2, FileText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    icon: <Database size={24} />,
    content: (
      <>
        <p style={{ marginBottom: "1rem" }}>
          We collect information to provide better services to our guests. The types of personal information we collect include:
        </p>
        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li><strong>Contact Information:</strong> Name, email address, phone number, and physical address.</li>
          <li><strong>Booking Information:</strong> Arrival and departure dates, room preferences, and special requests.</li>
          <li><strong>Identity Verification:</strong> Passport, driver's license, or other government-issued identification required by local law.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device identifiers, and usage data when you interact with our website or mobile applications.</li>
        </ul>
      </>
    )
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    icon: <Eye size={24} />,
    content: (
      <>
        <p style={{ marginBottom: "1rem" }}>
          Your personal data is utilized for the following core operational and service-oriented purposes:
        </p>
        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li>To process and manage your reservations, payments, and check-in/check-out procedures.</li>
          <li>To personalize your stay and fulfill specific requests (e.g., dietary requirements, room accessibility).</li>
          <li>To communicate with you regarding your booking, send pre-arrival instructions, and post-stay surveys.</li>
          <li>To comply with legal, regulatory, and law enforcement requirements in the jurisdictions where we operate.</li>
        </ul>
      </>
    )
  },
  {
    id: "payment-security",
    title: "3. Payment Security",
    icon: <Lock size={24} />,
    content: (
      <p>
        We do not store your full credit card information on our servers. All online transactions are processed securely through our PCI-DSS compliant payment gateway partner (Razorpay). Your payment data is encrypted using industry-standard TLS (Transport Layer Security) protocols during transmission to ensure maximum security against unauthorized access.
      </p>
    )
  },
  {
    id: "cookies",
    title: "4. Cookies and Tracking Technologies",
    icon: <Globe2 size={24} />,
    content: (
      <p>
        Our website uses cookies, web beacons, and similar tracking technologies to enhance user experience, analyze site traffic, and deliver targeted advertising. Essential cookies are required for the website to function (such as session management for booking). You can manage your cookie preferences through your browser settings, though disabling certain cookies may affect website functionality.
      </p>
    )
  },
  {
    id: "third-party",
    title: "5. Third-Party Services",
    icon: <FileText size={24} />,
    content: (
      <p>
        We may share your information with trusted third-party service providers who assist us in operating our hotel, conducting our business, or servicing you. This includes IT service providers, email delivery services, and marketing agencies. These parties are contractually obligated to keep your information confidential and use it only for the purposes for which we disclose it to them.
      </p>
    )
  },
  {
    id: "data-retention",
    title: "6. Data Retention",
    icon: <Database size={24} />,
    content: (
      <p>
        We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, tax and accounting regulations), resolve disputes, and enforce our legal agreements and policies.
      </p>
    )
  },
  {
    id: "privacy-rights",
    title: "7. GDPR & User Privacy Rights",
    icon: <ShieldCheck size={24} />,
    content: (
      <>
        <p style={{ marginBottom: "1rem" }}>
          Depending on your location, you may have the following rights regarding your personal data:
        </p>
        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li><strong>Right to Access:</strong> Request copies of your personal data.</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request deletion of your personal data under certain conditions.</li>
          <li><strong>Right to Restrict Processing:</strong> Request the restriction of processing your personal data.</li>
          <li><strong>Right to Data Portability:</strong> Request the transfer of your data to another organization.</li>
        </ul>
      </>
    )
  },
  {
    id: "contact",
    title: "8. Contact & Policy Updates",
    icon: <FileText size={24} />,
    content: (
      <p>
        We may update our Privacy Policy periodically. We will notify you of any material changes by posting the new Privacy Policy on this page. If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact our Data Protection Officer at privacy@hospitalityhub.com or call us at +91 9974295118.
      </p>
    )
  }
];

export default function PrivacyPolicyPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

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
                <ShieldCheck size={32} />
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
              Privacy Policy
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "1.1rem", lineHeight: 1.6 }}>
              Your privacy is critically important to us. This policy outlines how Hospitality Hub collects, uses, protects, and handles your personal information across our services.
            </p>
            <p style={{ color: "#64748B", fontSize: "0.9rem", marginTop: "1.5rem" }}>
              Last Updated: July 2026
            </p>
          </motion.div>
        </div>

        {/* Layout Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12">
            
            {/* Desktop Navigation / Sidebar */}
            <div className="hidden md:block" style={{ width: "100%", background: "rgba(26,34,53,0.3)", borderRadius: "1rem", padding: "2rem", border: "1px solid rgba(201,168,76,0.1)", alignSelf: "start", position: "sticky", top: "100px" }}>
              <h3 style={{ color: "#C9A84C", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                Table of Contents
              </h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sections.map((section) => (
                  <li key={`nav-${section.id}`}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94A3B8",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#F8FAFC"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#94A3B8"}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ color: "#C9A84C" }}>
                      {section.icon}
                    </div>
                    <h2 style={{ color: "#F8FAFC", fontSize: "1.75rem", fontWeight: 600, margin: 0 }}>
                      {section.title}
                    </h2>
                  </div>
                  <div style={{ color: "#CBD5E1", lineHeight: 1.8, fontSize: "1rem" }}>
                    {section.content}
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
