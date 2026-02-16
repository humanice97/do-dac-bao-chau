'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone } from 'lucide-react'
import { createClient, Engineer } from '@/lib/supabase'

interface EngineerFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingEngineer?: Engineer | null
}

export default function EngineerForm({
  isOpen,
  onClose,
  onSuccess,
  editingEngineer,
}: EngineerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  // Đồng bộ dữ liệu khi mở modal (thêm mới / chỉnh sửa)
  useEffect(() => {
    if (!isOpen) return

    if (editingEngineer) {
      setFormData({
        name: editingEngineer.name || '',
        phone: editingEngineer.phone || '',
      })
    } else {
      setFormData({
        name: '',
        phone: '',
      })
    }
  }, [editingEngineer, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (editingEngineer) {
        const { error } = await supabase
          .from('engineers')
          .update(formData)
          .eq('id', editingEngineer.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('engineers').insert([formData])

        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-secondary">
              {editingEngineer ? 'Chỉnh sửa kỹ sư' : 'Thêm kỹ sư mới'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-accent text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
              >
                {isLoading ? 'Đang lưu...' : editingEngineer ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

