'use client'

import { motion } from 'framer-motion'
import { FileText, GitBranch, Building, Map, ArrowRight } from 'lucide-react'

const services = [
  {
    icon: FileText,
    title: 'Đo đất cấp sổ đỏ',
    description:
      'Thực hiện đo đạc, lập hồ sơ địa chính để cấp Giấy chứng nhận quyền sử dụng đất (sổ đỏ) theo đúng quy định pháp luật.',
    features: ['Đo đạc ranh giới thửa đất', 'Lập bản đồ địa chính', 'Hoàn thiện hồ sơ pháp lý'],
  },
  {
    icon: GitBranch,
    title: 'Đo tách thửa',
    description:
      'Thực hiện đo đạc và tách thửa đất theo yêu cầu của khách hàng, đảm bảo đúng quy định về diện tích tối thiểu.',
    features: ['Phân chia thửa đất', 'Xác định ranh giới mới', 'Làm thủ tục pháp lý'],
  },
  {
    icon: Building,
    title: 'Đo hoàn công',
    description:
      'Đo đạc công trình xây dựng sau khi hoàn thành để làm thủ tục hoàn công, cấp phép xây dựng.',
    features: ['Đo đạc hiện trạng công trình', 'Lập bản vẽ hoàn công', 'Hoàn thiện hồ sơ'],
  },
  {
    icon: Map,
    title: 'Lập bản vẽ hiện trạng',
    description:
      'Lập bản vẽ hiện trạng khu đất, nhà ở và công trình xây dựng phục vụ các mục đích khác nhau.',
    features: ['Bản vẽ hiện trạng đất', 'Bản vẽ nhà ở', 'Bản vẽ công trình xây dựng'],
  },
]

export default function Services() {
  const handleScrollToContact = () => {
    const element = document.querySelector('#contact')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="services" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Dịch vụ của chúng tôi
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-secondary mb-4">
            Các dịch vụ đo đạc chuyên nghiệp
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Cung cấp đầy đủ các dịch vụ đo đạc địa chính, đáp ứng mọi nhu cầu của khách hàng tại Đà Nẵng
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 h-full border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <service.icon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold font-heading text-secondary mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                  {service.description}
                </p>
                <div className="space-y-2 mb-5">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleScrollToContact}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-accent transition-colors mt-auto"
                >
                  Tìm hiểu thêm
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

