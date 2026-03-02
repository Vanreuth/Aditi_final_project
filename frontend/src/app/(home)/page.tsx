import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { WhySection } from "@/components/home/WhySection";
import { TechMarquee } from "@/components/home/TechMarquee";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";
import { RoadmapSection } from "@/components/home/RoadmapSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";

const HomePage = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <StatsBar />
      <WhySection />
      <TechMarquee />
      <FeaturedCoursesSection />
      <RoadmapSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default HomePage;