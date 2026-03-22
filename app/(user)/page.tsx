import BenefitsSection from "../components/sections/benefits-section";
import CtaSection from "../components/sections/cta-section";
import HeroSection from "../components/sections/hero-section";
import PopularGamesSection from "../components/sections/popular-games-section";
import StepsSection from "../components/sections/steps-section";

export default function UserHomePage() {
  return (
    <main>
      <HeroSection />
      <PopularGamesSection />
      {/* <BenefitsSection /> */}
      <StepsSection />
      {/* <CtaSection /> */}
    </main>
  );
}
