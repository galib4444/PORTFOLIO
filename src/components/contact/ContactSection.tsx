"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check, Mail, Linkedin, Github } from "lucide-react";
import { contactInfo } from "@/data/stats";

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactInfo.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email");
    }
  };

  return (
    <section
      id="contact"
      className="py-24 px-4 md:px-8 lg:px-16 bg-[var(--bg-primary)]"
      ref={ref}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-12"
        >
          <h2 className="font-pixel text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] mb-4">
            LET&apos;S CONNECT
          </h2>
          <p className="text-[var(--text-secondary)] font-mono max-w-xl mx-auto">
            Have a project in mind or want to collaborate? I&apos;d love to hear
            from you.
          </p>
        </motion.div>

        {/* Email Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <button
            onClick={copyEmail}
            className="group inline-flex items-center gap-4 px-8 py-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--glass-border)] hover:border-[var(--accent-orange)] transition-all"
          >
            <Mail
              size={24}
              className="text-[var(--accent-orange)] group-hover:scale-110 transition-transform"
            />
            <span className="font-mono text-lg md:text-xl lg:text-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
              {contactInfo.email}
            </span>
            {copied ? (
              <Check size={20} className="text-[var(--accent-green)]" />
            ) : (
              <Copy
                size={20}
                className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
              />
            )}
          </button>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm font-mono text-[var(--accent-green)]"
            >
              Email copied to clipboard!
            </motion.p>
          )}
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <a
            href={contactInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-mono text-sm hover:opacity-90 transition-opacity"
          >
            <Linkedin size={18} />
            LinkedIn
          </a>
          <a
            href={contactInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 border border-[var(--text-primary)] text-[var(--text-primary)] rounded-full font-mono text-sm hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
          >
            <Github size={18} />
            GitHub
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-24 pt-8 border-t border-[var(--glass-border)]"
        >
          <p className="text-xs font-mono text-[var(--text-muted)]">
            © {new Date().getFullYear()} Galib Muktasin. Built with Next.js,
            Three.js & Framer Motion.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
