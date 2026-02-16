'use client'

import { motion } from 'framer-motion'
import { Phone, FileCheck, HandshakeIcon } from 'lucide-react'

const steps = [
  {
    icon: Phone,
    number: '01',
    title: 'Tư vấn',
    description:
      'Liên hệ tư vấn qua hotline hoặc form đăng ký. Chúng tôi phân tích nhu cầu và tư vấn giải pháp phù hợp.',
  },
  {
    icon: FileCheck,
    number: '02',
    title: 'Đo đạc',
    description:
      'Kỹ sư đến tận nơi khảo sát, đo đạc bằng thiết bị chuyên dụng đảm bảo độ chính xác cao.',
  },
  {
    icon: HandshakeIcon,
    number: '03',
    title: 'Bàn giao hồ sơ',
    description:
      'Hoàn thiện hồ sơ pháp lý, bàn giao kết quả và hỗ trợ làm thủ tục xin cấp sổ đỏ.',
  },
]

export default function Process() {
  return (
    <section id="process" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Quy trình làm việc
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-secondary mb-4">
            3 bước đơn giản
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Quy trình làm việc minh bạch, nhanh chóng và chuyên nghiệp
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Timeline line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[16%] right-[16%] h-1 bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-white rounded-full border-4 border-primary flex items-center justify-center mx-auto shadow-lg relative z-10">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-20">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-heading text-secondary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

