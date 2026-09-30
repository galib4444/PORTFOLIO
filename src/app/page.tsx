import { NavigationDock } from "@/components/navigation/NavigationDock";
import { HeroSection } from "@/components/hero/HeroSection";
import { WorksWheelSection } from "@/components/home/WorksWheelSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { ExperienceTimeline } from "@/components/home/ExperienceTimeline";
import { ContactSection } from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <>
      <NavigationDock />
      <main id="main-content">
        <HeroSection />
        <ServicesSection />
        <WorksWheelSection />
        <ExperienceTimeline />
        <ContactSection />
      </main>
    </>
  );
}
