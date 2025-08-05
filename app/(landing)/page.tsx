import { LandingNavbarMock } from "@/components/landing-navbar-mock";
import { LandingHeroMock } from "@/components/landing-hero-mock";
import { LandingContent } from "@/components/landing-content";

const LandingPage = () => {
  return (
    <div className="h-full ">
      <LandingNavbarMock />
      <LandingHeroMock />
      <LandingContent />
    </div>
  );
};

export default LandingPage;
