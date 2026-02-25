'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Building2, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, FileCheck, Award, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const statusLabels: { [key: string]: { label: string; color: string; icon: any } } = {
  pending: { label: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  processing: { label: 'Đang xử lý', color: 'text-blue-600 bg-blue-50', icon: Clock },
  has_result: { label: 'Đã có kết quả', color: 'text-purple-600 bg-purple-50', icon: FileCheck },
  completed: { label: 'Hoàn thành (đã trả kết quả)', color: 'text-green-600 bg-green-50', icon: Award },
  cancelled: { label: 'Đã hủy', color: 'text-red-600 bg-red-50', icon: XCircle }
}

export default function TrackPage() {
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setProject(null)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status, received_date, result_date, code, customer_name, start_date, service_type, drawing_url')
        .eq('code', code)
        .eq('customer_phone', phone)
        .single()

      if (error || !data) {
        setError('Không tìm thấy hồ sơ. Vui lòng kiểm tra lại mã hồ sơ và số điện thoại.')
        return
      }

      setProject(data)
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  // Kiểm tra hồ sơ có trễ không
  const isLate = (project: any) => {
    if (project.status === 'completed' || project.status === 'cancelled') return false

    const startDate = new Date(project.start_date || project.created_at)
    const today = new Date()
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 30
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-800 to-blue-900 py-20 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Tra cứu hồ sơ</h1>
          <p className="text-blue-200">Bảo Châu Survey - Hệ thống tra cứu online</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-6 mb-6"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã hồ sơ
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Ví dụ: BC-2025-001"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Nhập số điện thoại đăng ký"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Tra cứu
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Result */}
        {project && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6"
          >
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusLabels[project.status]?.color || 'bg-gray-100'}`}>
                {(() => {
                  const Icon = statusLabels[project.status]?.icon || Clock
                  return <Icon className="w-5 h-5" />
                })()}
                <span className="font-semibold">{statusLabels[project.status]?.label || project.status}</span>
              </div>
              {isLate(project) && (
                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Hồ sơ trễ (quá 30 ngày)
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Mã hồ sơ</span>
                <span className="font-semibold text-secondary">{project.code}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Khách hàng</span>
                <span className="font-semibold text-secondary">{project.customer_name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Ngày tiếp nhận</span>
                <span className="font-semibold text-secondary">
                  {project.received_date ? new Date(project.received_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-500">Ngày dự kiến trả kết quả</span>
                <span className="font-semibold text-secondary">
                  {project.result_date ? new Date(project.result_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                </span>
              </div>
            </div>

            {/* Nút tải bản vẽ */}
            {project.drawing_url && (
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
                <a
                  href={project.drawing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Tải Bản Vẽ Kỹ Thuật
                </a>
              </div>
            )}
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-blue-200 text-sm mt-8"
        >
          © 2025 Bảo Châu Survey. Hotline: 0905.123.456
        </motion.p>
      </div>
    </div>
  )
}
