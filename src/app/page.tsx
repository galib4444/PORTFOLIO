import { NavigationDock } from "@/components/navigation/NavigationDock";
import { HeroSection } from "@/components/hero/HeroSection";
import { WorksWheelSection } from "@/components/home/WorksWheelSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { ExperiencePreview } from "@/components/home/ExperiencePreview";
import { ContactSection } from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <>
      <NavigationDock />
      <main id="main-content">
        <HeroSection />
        <ServicesSection />
        <WorksWheelSection />
        <ExperiencePreview />
        <ContactSection />
      </main>
    </>
  );
}
