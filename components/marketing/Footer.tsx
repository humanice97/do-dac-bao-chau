'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Facebook, Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-secondary pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <h3 className="text-white font-bold font-heading text-2xl mb-4">
              Bảo Châu Survey
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              Đơn vị chuyên cung cấp dịch vụ đo đạc địa chính, làm sổ đỏ, tách thửa tại Đà Nẵng.
              Với đội ngũ kỹ sư chuyên nghiệp và 5+ năm kinh nghiệm.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center text-white transition-colors"
                aria-label="Zalo"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:0905123456"
                  className="flex items-center gap-3 text-gray-400 hover:text-accent transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>0905.123.456</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@baochau.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>contact@baochau.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Đà Nẵng, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>7h00 - 18h00 (T2-CN)</span>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-white font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-gray-400 hover:text-accent transition-colors">
                  Đo đất cấp sổ đỏ
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-accent transition-colors">
                  Đo tách thửa
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-accent transition-colors">
                  Đo hoàn công
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-accent transition-colors">
                  Lập bản vẽ hiện trạng
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2025 Bảo Châu Survey. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

