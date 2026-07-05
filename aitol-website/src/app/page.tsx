import Nav from "@/components/Nav";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import CompressionChart from "@/components/sections/CompressionChart";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Pricing from "@/components/sections/Pricing";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/Footer";
import FeatureDetails from "@/components/sections/FeatureDetails";
import Blueprint from "@/components/sections/Blueprint";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Stats />
      <CompressionChart />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <FeatureDetails />
      <Blueprint />
      <Footer />
    </main>
  );
}
