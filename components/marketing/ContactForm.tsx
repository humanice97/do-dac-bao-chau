'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MapPin, User, FileText, Send, CheckCircle } from 'lucide-react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    need: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsSubmitted(true)

    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', phone: '', address: '', need: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section id="contact" className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-accent/20 text-accent font-semibold px-4 py-2 rounded-full text-sm mb-4">
              Liên hệ ngay
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-6">
              Đăng ký tư vấn miễn phí
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Điền thông tin vào form bên cạnh, chúng tôi sẽ liên hệ tư vấn trong vòng 24 giờ. Hoặc
              gọi trực tiếp qua hotline.
            </p>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <p className="text-gray-400 text-sm mb-2">Hotline 24/7</p>
              <a
                href="tel:0905123456"
                className="text-4xl sm:text-5xl font-bold font-heading text-accent hover:text-white transition-colors block mb-4"
              >
                0905.123.456
              </a>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>Đà Nẵng, Việt Nam</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-secondary mb-2">
                    Đăng ký thành công!
                  </h3>
                  <p className="text-gray-600">
                    Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                  </p>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-secondary mb-6">
                    Nhận tư vấn miễn phí
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base min-h-[56px]"
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base min-h-[56px]"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ khu đất
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base min-h-[56px]"
                          placeholder="Nhập địa chỉ khu đất"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhu cầu cụ thể
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          name="need"
                          value={formData.need}
                          onChange={handleChange}
                          rows={3}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-base"
                          placeholder="Mô tả nhu cầu của bạn (ví dụ: đo đất làm sổ đỏ, tách thửa...)"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30 min-h-[56px] text-base"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Nhận tư vấn miễn phí
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

