"use client";

import AboutSection from "@/components/landing/about";
import CallToAction from "@/components/landing/cta";
import FeaturesSection from "@/components/landing/features";
import FooterSection from "@/components/landing/footer";
import LandingHeader from "@/components/landing/header";
import HeroSection from "@/components/landing/hero";

export default function Home() {
  return (
    <>
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CallToAction />
      <FooterSection />
    </>
  );
}
