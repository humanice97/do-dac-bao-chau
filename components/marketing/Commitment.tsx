'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, HeartHandshake, FileCheck } from 'lucide-react'

const commitments = [
  {
    icon: Shield,
    text: 'Không phát sinh chi phí ngoài báo giá',
  },
  {
    icon: Clock,
    text: 'Hoàn thành đúng tiến độ cam kết',
  },
  {
    icon: FileCheck,
    text: 'Hồ sơ hợp lệ, đảm bảo pháp lý',
  },
  {
    icon: HeartHandshake,
    text: 'Hỗ trợ tận tâm 24/7',
  },
]

export default function Commitment() {
  return (
    <section id="commitment" className="py-20 lg:py-28 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-white/10 text-white font-semibold px-4 py-2 rounded-full text-sm mb-4">
              Cam kết của chúng tôi
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-6">
              Chúng tôi cam kết mang đến dịch vụ tốt nhất
            </h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Với phương châm "Uy tín – Chính xác – Nhanh chóng", Bảo Châu Survey cam kết đồng hành
              cùng khách hàng trong mọi thủ tục đo đạc.
            </p>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30"
            >
              Liên hệ ngay
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <div className="space-y-6">
              {commitments.map((commitment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <commitment.icon className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-white text-lg font-medium pt-2">{commitment.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

