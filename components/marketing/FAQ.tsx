'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Thủ tục đo đất làm sổ đỏ mất bao lâu?',
    answer:
      'Thời gian thực hiện phụ thuộc vào diện tích và độ phức tạp của thửa đất. Thông thường, quá trình đo đạc và lập hồ sơ mất 3-7 ngày làm việc. Sau đó, thủ tục cấp sổ đỏ tại cơ quan nhà nước mất thêm 15-30 ngày làm việc tùy theo từng trường hợp.',
  },
  {
    question: 'Chi phí đo đất làm sổ đỏ là bao nhiêu?',
    answer:
      'Chi phí đo đạc được tính theo diện tích thửa đất và mức độ phức tạp của công trình. Chúng tôi cung cấp báo giá miễn phí sau khi khảo sát hiện trường. Liên hệ hotline 0905.123.456 để được tư vấn và báo giá cụ thể.',
  },
  {
    question: 'Cần chuẩn bị những giấy tờ gì để đo đất?',
    answer:
      'Các giấy tờ cần thiết bao gồm: CMND/CCCD của chủ đất, giấy tờ chứng minh quyền sử dụng đất (nếu có), đơn đề nghị đo đạc. Chúng tôi sẽ hướng dẫn chi tiết và hỗ trợ chuẩn bị đầy đủ hồ sơ khi tiếp nhận yêu cầu.',
  },
  {
    question: 'Có hỗ trợ ngoài giờ hành chính không?',
    answer:
      'Có, chúng tôi hỗ trợ khách hàng 24/7. Bạn có thể liên hệ hotline bất kỳ lúc nào để được tư vấn. Đối với khảo sát hiện trường, chúng tôi có thể sắp xếp linh hoạt theo thời gian của bạn, kể cả cuối tuần.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Câu hỏi thường gặp
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-secondary mb-4">
            Giải đáp thắc mắc
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Những câu hỏi phổ biến về dịch vụ đo đạc của chúng tôi
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary/30 transition-colors bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 pr-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-secondary text-base sm:text-lg">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pl-20">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

