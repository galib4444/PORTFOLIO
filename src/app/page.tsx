import { NavigationDock } from "@/components/navigation/NavigationDock";
import { HeroSection } from "@/components/hero/HeroSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { ContactSection } from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <>
      <NavigationDock />
      <main id="main-content">
        <HeroSection />
        <ServicesSection />
        <ContactSection />
      </main>
    </>
  );
}
