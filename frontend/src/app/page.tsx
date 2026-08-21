import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Companies from "@/components/landing/Companies";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Stats from "@/components/landing/Stats";
import DashboardPreview from "@/components/landing/DashboardPreview";
import Testimonials from "@/components/landing/Testimonials";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      <Navbar />

      <HeroSection />

      <Companies />

      <FeaturesSection />

      <Stats />

      <DashboardPreview />

      <Testimonials />

      <Faq />

      <Footer />

    </main>
  );
}