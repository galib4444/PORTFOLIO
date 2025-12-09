import { Metadata } from "next";
import { NavigationDock } from "@/components/navigation/NavigationDock";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Experience | Galib Muktasin",
  description: "Galib Muktasin's professional experience - building production software and advising startups.",
};

export default function ExperiencePage() {
  return (
    <>
      <NavigationDock />
      <main id="main-content">
        <ExperienceSection />
        <ContactSection />
      </main>
    </>
  );
}
