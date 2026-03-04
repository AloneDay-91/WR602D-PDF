import React from "react";
import HeroSection from "../components/sections/HeroSection";
import ToolsSection from "../components/sections/ToolsSection";
import PricingSection from "../components/sections/PricingSection";
import FaqSection from "../components/sections/FaqSection";
import CtaSection from "../components/sections/CtaSection";

export default function Home({ plans = [], tools = [] }) {
    return (
        <div className="bg-grid">
            <HeroSection />
<<<<<<< Updated upstream
            <ToolsSection tools={tools} />
            <PricingSection plans={plans} />
=======
            <ToolsSection tools={tools} user={user} />
            <PricingSection plans={plans} tools={tools} />
>>>>>>> Stashed changes
            <FaqSection />
            <CtaSection />
        </div>
    );
}