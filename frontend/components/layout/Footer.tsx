'use client';
import Link from "next/link";
import { Crown, MapPin, Phone, Mail, Share2, MessageCircle, Globe, Play } from "lucide-react";

const footerLinks = {
  Explore: [
    { label: "Home", href: "/" },
    { label: "Our Rooms", href: "/rooms" },
    { label: "Services", href: "/services" },
    { label: "Dining", href: "/services#restaurant" },
    { label: "Spa & Wellness", href: "/services#spa" },
  ],
  "Room Types": [
    { label: "Standard Rooms", href: "/rooms?type=standard" },
    { label: "Deluxe Rooms", href: "/rooms?type=deluxe" },
    { label: "Premium Suites", href: "/rooms?type=suite" },
    { label: "Presidential Suite", href: "/rooms?type=presidential" },
  ],
  Support: [
    { label: "Book a Room", href: "/rooms" },
    { label: "FAQs", href: "/faqs" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "#060B16", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#C9A84C,#A07A2E)" }}
              >
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-xl">Hospitality Hub</p>
                <p className="text-xs" style={{ color: "#C9A84C", letterSpacing: "0.15em" }}>
                  LUXURY HOTEL
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#64748B" }}>
              Where luxury meets comfort. Experience world-class hospitality with personalized service, stunning accommodations, and unforgettable moments at Hospitality Hub.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm" style={{ color: "#64748B" }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
                Parul Institute of Technology 
              </div>
              <div className="flex items-start gap-3 text-sm" style={{ color: "#64748B" }}>
                <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C9A84C" }} />
                <div className="flex flex-col gap-2">
                  <a href="tel:+919974295118" className="hover:text-[#F8FAFC] transition-colors duration-200">+91 9974295118</a>
                  <a href="tel:+919313343179" className="hover:text-[#F8FAFC] transition-colors duration-200">+91 9313343179</a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm" style={{ color: "#64748B" }}>
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C9A84C" }} />
                <div className="flex flex-col gap-2">
                  <a href="mailto:2403051051049@paruluniversity.ac.in" className="hover:text-[#F8FAFC] transition-colors duration-200 break-all">2403051051049@paruluniversity.ac.in</a>
                  <a href="mailto:khuntpreet12@gmail.com" className="hover:text-[#F8FAFC] transition-colors duration-200">khuntpreet12@gmail.com</a>
                </div>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-8">
              {[Share2, MessageCircle, Globe, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="/"
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                  style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.25)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.1)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="font-semibold text-sm mb-5 tracking-widest uppercase"
                style={{ color: "#C9A84C" }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200 animated-underline"
                      style={{ color: "#64748B" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm border-t"
          style={{ borderColor: "rgba(201,168,76,0.1)", color: "#64748B" }}
        >
          <p>© 2026 Hospitality Hub. All rights reserved.</p>
          <p>
            Crafted with ❤️ for{" "}
            <span style={{ color: "#C9A84C" }}>luxury hospitality</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
