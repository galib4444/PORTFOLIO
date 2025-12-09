import { Metadata } from "next";
import { NavigationDock } from "@/components/navigation/NavigationDock";
import { AboutSection } from "@/components/about/AboutSection";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "About | Galib Muktasin",
  description: "Learn more about Galib Muktasin - AI Engineer & Tech Strategist. Skills, education, and character stats.",
};

export default function AboutPage() {
  return (
    <>
      <NavigationDock />
      <main id="main-content">
        <AboutSection />
        <ContactSection />
      </main>
    </>
  );
}
