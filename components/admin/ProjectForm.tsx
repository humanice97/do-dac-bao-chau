'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, MapPin, FileText, DollarSign, Calendar, UserCircle } from 'lucide-react'
import { createClient, Project, Engineer } from '@/lib/supabase'

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingProject?: Project | null
}

const serviceTypes = [
  { value: 'do_so_do', label: 'Đo đất cấp sổ đỏ' },
  { value: 'tach_thua', label: 'Đo tách thửa' },
  { value: 'hoan_cong', label: 'Đo hoàn công' },
  { value: 'ban_ve', label: 'Lập bản vẽ hiện trạng' },
  { value: 'cam_moc_toa_do', label: 'Đo cắm mốc theo tọa độ' },
]

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'has_result', label: 'Đã có kết quả' },
  { value: 'completed', label: 'Hoàn thành (đã trả kết quả)' },
  { value: 'cancelled', label: 'Đã hủy' },
]

export default function ProjectForm({ isOpen, onClose, onSuccess, editingProject }: ProjectFormProps) {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    service_type: 'do_so_do',
    received_date: new Date().toISOString().split('T')[0],
    result_date: '',
    status: 'pending',
    total_price: 0,
    engineer_id: '',
    notes: '',
  })
  const [drawingFile, setDrawingFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchEngineers()
  }, [])

  // Đồng bộ dữ liệu khi mở modal (thêm mới / chỉnh sửa)
  useEffect(() => {
    if (!isOpen) return

    if (editingProject) {
      setFormData({
        customer_name: editingProject.customer_name || '',
        customer_phone: editingProject.customer_phone || '',
        address: editingProject.address || '',
        service_type: editingProject.service_type || 'do_so_do',
        received_date: editingProject.received_date || new Date().toISOString().split('T')[0],
        result_date: editingProject.result_date || '',
        status: editingProject.status || 'pending',
        total_price: editingProject.total_price || 0,
        engineer_id: editingProject.engineer_id || '',
        notes: editingProject.notes || '',
      })
      setDrawingFile(null)
    } else {
      const today = new Date().toISOString().split('T')[0]
      const resultDate = new Date()
      resultDate.setDate(resultDate.getDate() + 30)
      const resultDateStr = resultDate.toISOString().split('T')[0]

      setFormData({
        customer_name: '',
        customer_phone: '',
        address: '',
        service_type: 'do_so_do',
        received_date: today,
        result_date: resultDateStr,
        status: 'pending',
        total_price: 0,
        engineer_id: '',
        notes: '',
      })
      setDrawingFile(null)
    }
  }, [editingProject, isOpen])

  const fetchEngineers = async () => {
    const { data } = await supabase.from('engineers').select('*')
    if (data) setEngineers(data)
  }

  // Handle received date change and auto-calc result date (30 days later)
  const handleReceivedDateChange = (date: string) => {
    const receivedDate = new Date(date)
    const resultDate = new Date(receivedDate)
    resultDate.setDate(resultDate.getDate() + 30)

    setFormData((prev) => ({
      ...prev,
      received_date: date,
      result_date: resultDate.toISOString().split('T')[0],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let drawingUrl = editingProject?.drawing_url || null

      // Upload PDF bản vẽ nếu có file mới được chọn
      if (drawingFile) {
        const fileExt = drawingFile.name.split('.').pop()
        const fileName = `drawing-${Date.now()}.${fileExt}`
        const filePath = `drawings/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-drawings')
          .upload(filePath, drawingFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'application/pdf',
          })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('project-drawings')
          .getPublicUrl(uploadData.path)

        drawingUrl = publicUrlData.publicUrl
      }

      const payload = {
        ...formData,
        drawing_url: drawingUrl,
      }

      if (editingProject) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('projects').insert([payload])
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-secondary">
              {editingProject ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Nhập tên khách hàng"
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
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Nhập địa chỉ khu đất"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại dịch vụ
              </label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                {serviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tiếp nhận <span className="text-xs text-gray-400">(dd/mm/yyyy)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => handleReceivedDateChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tự động tính ngày trả kết quả sau 30 ngày
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày trả kết quả <span className="text-xs text-gray-400">(dd/mm/yyyy)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.result_date}
                    onChange={(e) => setFormData({ ...formData, result_date: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng giá (VNĐ)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.total_price}
                    onChange={(e) =>
                      setFormData({ ...formData, total_price: Number(e.target.value) })
                    }
                    min="0"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Nhập tổng giá"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người thực hiện
              </label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.engineer_id}
                  onChange={(e) => setFormData({ ...formData, engineer_id: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">-- Chọn người thực hiện --</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>

            {/* Upload bản vẽ PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bản vẽ thửa đất (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setDrawingFile(file)
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {editingProject?.drawing_url && !drawingFile && (
                <p className="text-sm text-gray-500 mt-2">
                  Đã có file:&nbsp;
                  <a
                    href={editingProject.drawing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:text-accent underline"
                  >
                    Xem bản vẽ hiện tại
                  </a>
                  &nbsp;— chọn PDF mới để thay thế.
                </p>
              )}
              {drawingFile && (
                <p className="text-sm text-gray-500 mt-2">
                  File đã chọn: <span className="font-medium">{drawingFile.name}</span>
                </p>
              )}
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
                {isLoading ? 'Đang lưu...' : editingProject ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

