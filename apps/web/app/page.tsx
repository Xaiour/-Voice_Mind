"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { VoiceAnalysisSection } from "@/components/landing/VoiceAnalysisSection";
import { BiomarkerCards } from "@/components/landing/BiomarkerCards";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-transparent to-cyan-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <LandingNavbar />
        <HeroSection />
        <VoiceAnalysisSection />
        <BiomarkerCards />
        <DashboardPreview />
        <HowItWorks />
        <Testimonials />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
