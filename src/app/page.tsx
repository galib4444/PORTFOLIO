import { NavigationDock } from "@/components/navigation/NavigationDock";
import { HeroSection } from "@/components/hero/HeroSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { AboutSection } from "@/components/about/AboutSection";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { ExperiencePreview } from "@/components/home/ExperiencePreview";
import { ContactSection } from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <>
      <NavigationDock />
      <main id="main-content">
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <ProjectsPreview />
        <ExperiencePreview />
        <ContactSection />
      </main>
    </>
  );
}
