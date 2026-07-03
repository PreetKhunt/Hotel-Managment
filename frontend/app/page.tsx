import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HotelIntro from "@/components/home/HotelIntro";
import FeaturedRooms from "@/components/home/FeaturedRooms";
import AmenitiesGrid from "@/components/home/AmenitiesGrid";
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
import CallToAction from "@/components/home/CallToAction";

export default function Home() {
  return (
    <main style={{ background: "#0A0F1E" }}>
      <Navbar />
      <HeroSection />
      <HotelIntro />
      <FeaturedRooms />
      <AmenitiesGrid />
      <TestimonialsCarousel />
      <CallToAction />
      <Footer />
    </main>
  );
}
