"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NavItem } from "@/types";

const navItems: NavItem[] = [
  { id: "home", label: "HOME", href: "/" },
  { id: "about", label: "ABOUT", href: "/about" },
  { id: "projects", label: "PROJECTS", href: "/projects" },
  { id: "experience", label: "EXPERIENCE", href: "/experience" },
];

export function NavigationDock() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Dock */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.6, 0.01, 0.05, 0.95] }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:block"
      >
        <div className="flex items-center gap-6 px-4 py-3 rounded-full glass-dock">
          {/* Avatar */}
          <Link href="/" className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--accent-orange)] bg-[var(--bg-tertiary)] flex items-center justify-center hover:scale-105 transition-transform">
            <span className="text-lg font-bold text-[var(--text-primary)]">
              G
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "text-sm font-mono tracking-wide transition-colors relative",
                  isActive(item.href)
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--accent-orange)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Contact CTA */}
          <Link
            href="/#contact"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            CONTACT
            <Plus size={16} />
          </Link>
        </div>
      </motion.nav>

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 rounded-full glass-dock flex items-center justify-center"
      >
        <Menu size={24} className="text-white" />
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--bg-secondary)] rounded-t-3xl p-6 pb-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <X size={24} className="text-[var(--text-primary)]" />
              </button>

              {/* Profile */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--accent-orange)] bg-[var(--bg-tertiary)] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    G
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">
                    Galib Muktasin
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    AI Engineer
                  </p>
                </div>
              </Link>

              {/* Nav Items */}
              <div className="space-y-2 mb-8">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block w-full text-left px-4 py-3 rounded-xl text-lg font-mono transition-colors",
                      isActive(item.href)
                        ? "bg-[var(--accent-orange)] text-white"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Contact Button */}
              <Link
                href="/#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-lg font-medium"
              >
                CONTACT
                <Plus size={20} />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
