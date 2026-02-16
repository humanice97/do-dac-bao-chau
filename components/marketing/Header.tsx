'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Menu, X } from 'lucide-react'

const menuItems = [
  { label: 'Dịch vụ', href: '#services' },
  { label: 'Quy trình', href: '#process' },
  { label: 'Cam kết', href: '#commitment' },
  { label: 'FAQ', href: '#faq' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`font-bold font-heading text-xl lg:text-2xl transition-colors ${
                isScrolled ? 'text-primary' : 'text-white'
              }`}
            >
              Bảo Châu Survey
            </a>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className={`font-medium transition-colors hover:text-accent ${
                    isScrolled ? 'text-secondary' : 'text-white/90'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href="tel:0905123456"
                className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-orange-500/30"
              >
                <Phone className="w-4 h-4" />
                0905.123.456
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-secondary hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full text-left px-4 py-3 text-secondary font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <a
                  href="tel:0905123456"
                  className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white font-semibold px-4 py-3.5 rounded-lg transition-colors mt-4"
                >
                  <Phone className="w-5 h-5" />
                  Gọi ngay: 0905.123.456
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Hotline Button (Fixed) */}
      <a
        href="tel:0905123456"
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent hover:bg-orange-600 text-white rounded-full shadow-xl shadow-orange-500/40 flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse"
        aria-label="Gọi hotline"
      >
        <Phone className="w-6 h-6" />
      </a>
    </>
  )
}

