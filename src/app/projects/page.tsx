import { Metadata } from "next";
import { NavigationDock } from "@/components/navigation/NavigationDock";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Projects | Galib Muktasin",
  description: "Explore Galib Muktasin's projects - from AI-powered platforms to post-quantum cryptography research.",
};

export default function ProjectsPage() {
  return (
    <>
      <NavigationDock />
      <main id="main-content">
        <ProjectsSection />
        <ContactSection />
      </main>
    </>
  );
}
