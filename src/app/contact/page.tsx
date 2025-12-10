import { Metadata } from "next";
import { NavigationDock } from "@/components/navigation/NavigationDock";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact | Galib Muktasin",
  description: "Get in touch with Galib Muktasin - AI Engineer & Tech Strategist. Let's collaborate on your next project.",
};

export default function ContactPage() {
  return (
    <>
      <NavigationDock />
      <main id="main-content" className="min-h-screen flex items-center justify-center">
        <ContactSection />
      </main>
    </>
  );
}
