'use client'

import { motion } from 'framer-motion'
import { Award, Users, Scale } from 'lucide-react'

const trustItems = [
  {
    icon: Users,
    title: '5+ năm kinh nghiệm',
    description: 'Hoạt động chuyên nghiệp trong lĩnh vực đo đạc địa chính tại Đà Nẵng',
  },
  {
    icon: Award,
    title: 'Kỹ sư có chứng chỉ',
    description: 'Đội ngũ kỹ sư được cấp chứng chỉ hành nghề đo đạc theo quy định pháp luật',
  },
  {
    icon: Scale,
    title: 'Am hiểu pháp lý Đà Nẵng',
    description: 'Nắm vững quy trình, thủ tục pháp lý và đặc thù địa phương tại Đà Nẵng',
  },
]

export default function Trust() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-accent/10 text-accent font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Tại sao chọn chúng tôi
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-secondary mb-4">
            Uy tín từ chất lượng dịch vụ
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Chúng tôi cam kết mang đến dịch vụ đo đạc chuyên nghiệp, chính xác và đúng quy định
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-2xl p-8 h-full border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold font-heading text-secondary mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

