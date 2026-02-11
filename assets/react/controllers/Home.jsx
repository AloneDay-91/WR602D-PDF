import React from "react";
import HeroSection from "../components/sections/HeroSection";
import ToolsSection from "../components/sections/ToolsSection";
import PricingSection from "../components/sections/PricingSection";
import FaqSection from "../components/sections/FaqSection";
import CtaSection from "../components/sections/CtaSection";

export default function Home() {
    return (
        <div className="bg-grid">
            <HeroSection />
            <ToolsSection />
            <PricingSection />
            <FaqSection />
            <CtaSection />
        </div>
    );
}