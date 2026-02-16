'use client'

import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'

const galleryItems = [
  {
    title: 'Đo đạc hiện trường',
    description: 'Kỹ sư đang thực hiện đo đạc tại hiện trường',
  },
  {
    title: 'Thiết bị chuyên dụng',
    description: 'Máy toàn đạc điện tử hiện đại',
  },
  {
    title: 'Lập bản đồ',
    description: 'Xử lý số liệu và lập bản đồ địa chính',
  },
  {
    title: 'Khảo sát địa hình',
    description: 'Đo đạc địa hình phức tạp',
  },
  {
    title: 'Bàn giao hồ sơ',
    description: 'Trao đổi và bàn giao hồ sơ cho khách hàng',
  },
  {
    title: 'Hỗ trợ khách hàng',
    description: 'Tư vấn và giải đáp thắc mắc',
  },
]

export default function Gallery() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Hình ảnh hoạt động
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-secondary mb-4">
            Dự án đã thực hiện
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Một số hình ảnh từ các dự án đo đạc tại Đà Nẵng
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-gray-200 aspect-[4/3] cursor-pointer"
            >
              {/* Placeholder Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <span className="text-gray-500 text-sm font-medium">{item.title}</span>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              </div>

              {/* Border Effect */}
              <div className="absolute inset-0 border-4 border-transparent group-hover:border-accent transition-colors duration-300 rounded-2xl"></div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          * Hình ảnh minh họa. Liên hệ để xem portfolio đầy đủ.
        </motion.p>
      </div>
    </section>
  )
}

