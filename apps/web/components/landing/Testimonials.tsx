"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Clinical Psychologist",
    quote: "VoiceMind gives me objective data that complements my clinical intuition. The stress scoring aligns remarkably with patient self-reports.",
    rating: 5,
  },
  {
    name: "Dr. Marcus Rivera",
    role: "Psychiatrist, UCSF",
    quote: "I use it to track patient progress between sessions. The emotional trend data helps me adjust treatment plans proactively.",
    rating: 5,
  },
  {
    name: "Dr. Aisha Patel",
    role: "Therapy Practice Owner",
    quote: "My team of 12 therapists adopted it within a week. The AI chat assistant alone saves us hours on clinical note generation.",
    rating: 5,
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Trusted by Clinicians
          </h2>
          <p className="mt-4 text-white/40">
            See what mental health professionals say about VoiceMind.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-white/60 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/40">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
