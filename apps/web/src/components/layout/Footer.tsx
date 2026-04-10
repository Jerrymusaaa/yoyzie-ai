'use client'
import Link from 'next/link'
import { Zap } from 'lucide-react'

const FOOTER_LINKS = {
  Product: ['Features', 'Integrations', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Status', 'Community'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-14">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)' }} className="text-white font-bold text-lg">
                Yoyzie <span className="text-[#0066FF]">AI.</span>
              </span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-[200px]">
              AI-powered social media management for the Kenyan market.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white/70 text-sm font-medium mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <Link href="#" className="text-white/35 text-sm hover:text-white/70 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">© 2025 Yoyzie AI. All rights reserved.</p>
          <p className="text-white/20 text-xs">Built with ❤ for Kenya&apos;s social media creators</p>
        </div>
      </div>
    </footer>
  )
}
