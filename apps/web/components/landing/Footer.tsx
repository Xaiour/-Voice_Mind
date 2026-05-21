"use client";

import { Brain } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-purple-400" />
              <span className="font-bold text-white">VoiceMind</span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed">
              AI-powered voice analysis for emotional wellness. Built for
              mental health professionals.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/30">
              <li><Link href="#features" className="hover:text-white/60 transition">Features</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">API Docs</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">Integrations</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/30">
              <li><Link href="#" className="hover:text-white/60 transition">About</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/30">
              <li><Link href="#" className="hover:text-white/60 transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">HIPAA Compliance</Link></li>
              <li><Link href="#" className="hover:text-white/60 transition">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; 2024 VoiceMind. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Built with care for mental health professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
