'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, MapPin, FileText, DollarSign, Calendar, UserCircle, Layers, Activity } from 'lucide-react'
import { createClient, Project, Engineer, LandParcel } from '@/lib/supabase'
import CustomSelect from '@/components/admin/CustomSelect'

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingProject?: Project | null
  userRole?: string
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

const wardOptions = [
  'Xã Điện Bàn Tây',
  'Xã Gò Nổi',
  'Phường Điện Bàn',
  'Phường Điện Bàn Bắc',
  'Phường Điện Bàn Đông'
]

export default function ProjectForm({ isOpen, onClose, onSuccess, editingProject, userRole = 'engineer' }: ProjectFormProps) {
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
  const [addressDetail, setAddressDetail] = useState('')
  const [provinceCode, setProvinceCode] = useState<number | ''>('')
  const [wardCode, setWardCode] = useState<number | ''>('')

  const [provinces, setProvinces] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  const [drawingFile, setDrawingFile] = useState<File | null>(null)
  const [landParcels, setLandParcels] = useState<Partial<LandParcel>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchEngineers()
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (provinceCode) {
      fetch(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`)
        .then(r => r.json())
        .then(data => setWards(data.wards || []))
        .catch(console.error)
    } else {
      setWards([])
      setWardCode('')
    }
  }, [provinceCode])

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
      setAddressDetail(editingProject.address || '')
      setProvinceCode('')
      setWardCode('')
      setDrawingFile(null)
      fetchLandParcels(editingProject.id)
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
      setAddressDetail('')
      setProvinceCode('')
      setWardCode('')
      setDrawingFile(null)
      setLandParcels([])
    }
  }, [editingProject, isOpen])

  const fetchEngineers = async () => {
    const { data } = await supabase.from('engineers').select('*')
    if (data) setEngineers(data)
  }

  const fetchLandParcels = async (projectId: string) => {
    const { data } = await supabase.from('land_parcels').select('*').eq('project_id', projectId)
    if (data) setLandParcels(data)
  }

  const handleAddParcel = () => {
    setLandParcels([...landParcels, {
      parcel_number: '',
      map_sheet_number: '',
      area: 0,
      land_type: '',
      address_commune_ward: '',
      address_district_city: 'Thành phố Đà Nẵng'
    }])
  }

  const handleRemoveParcel = (index: number) => {
    setLandParcels(landParcels.filter((_, i) => i !== index))
  }

  const handleParcelChange = (index: number, field: keyof LandParcel, value: string | number) => {
    const newParcels = [...landParcels]
    newParcels[index] = { ...newParcels[index], [field]: value }
    setLandParcels(newParcels)
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

      const provName = provinces.find(p => p.code === Number(provinceCode))?.name || ''
      const wardName = wards.find(w => w.code === Number(wardCode))?.name || ''

      const fullAddressParts = [addressDetail, wardName, provName].filter(Boolean)
      const finalAddress = fullAddressParts.length > 0 ? fullAddressParts.join(', ') : formData.address

      const payload = {
        ...formData,
        address: finalAddress,
        drawing_url: drawingUrl,
      }

      let projectId = editingProject?.id

      if (editingProject) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id)
        if (error) throw error
      } else {
        const { data: newProject, error } = await supabase.from('projects').insert([payload]).select().single()
        if (error) throw error
        projectId = newProject.id
      }

      // Handle Land Parcels
      if (projectId) {
        // Delete existing ones first (simple strategy, could be optimized)
        if (editingProject) {
          await supabase.from('land_parcels').delete().eq('project_id', projectId)
        }

        // Insert current ones
        if (landParcels.length > 0) {
          const parcelsToInsert = landParcels.map(p => ({
            ...p,
            project_id: projectId
          }))
          const { error: parcelError } = await supabase.from('land_parcels').insert(parcelsToInsert)
          if (parcelError) throw parcelError
        }
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 100, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 1 }}
          className="relative bg-white w-full h-[95vh] sm:h-auto sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        >
          <div className="sticky top-0 z-20 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-secondary">
              {editingProject ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
                Địa chỉ thường trú
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <CustomSelect
                  value={String(provinceCode)}
                  onChange={(val) => {
                    setProvinceCode(Number(val) || '')
                    setWardCode('')
                  }}
                  placeholder="-- Tỉnh/Thành phố --"
                  options={provinces.map(p => ({ value: String(p.code), label: p.name }))}
                />

                <CustomSelect
                  value={String(wardCode)}
                  onChange={(val) => setWardCode(Number(val) || '')}
                  disabled={!provinceCode}
                  placeholder="-- Xã/Phường --"
                  options={wards.map(w => ({ value: String(w.code), label: w.name }))}
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Số nhà, đường... (hoặc để nguyên địa chỉ cũ nếu có)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại dịch vụ
              </label>
              <CustomSelect
                value={formData.service_type}
                onChange={(val) => setFormData({ ...formData, service_type: val })}
                options={serviceTypes}
                icon={<Layers className="w-5 h-5" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={statusOptions}
                  icon={<Activity className="w-5 h-5" />}
                />
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
                    disabled={userRole !== 'admin'}
                    className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg outline-none ${userRole !== 'admin' ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary focus:border-transparent'}`}
                    placeholder="Nhập tổng giá"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người thực hiện
              </label>
              <CustomSelect
                value={formData.engineer_id}
                onChange={(val) => setFormData({ ...formData, engineer_id: val })}
                disabled={userRole !== 'admin'}
                placeholder="-- Chọn người thực hiện --"
                options={engineers.map((engineer) => ({
                  value: engineer.id,
                  label: engineer.name
                }))}
                icon={<UserCircle className="w-5 h-5" />}
              />
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

            {/* Quản lý Thửa Đất */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">Danh sách Thửa đất</h3>
                <button
                  type="button"
                  onClick={handleAddParcel}
                  className="text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  + Thêm thửa đất
                </button>
              </div>

              {landParcels.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  Chưa có thửa đất nào được thêm
                </p>
              ) : (
                <div className="space-y-4">
                  {landParcels.map((parcel, index) => (
                    <div key={index} className="relative bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleRemoveParcel(index)}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-5 h-5 sm:w-4 sm:h-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-2 sm:mt-0">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Số thửa</label>
                          <input
                            type="text"
                            value={parcel.parcel_number || ''}
                            onChange={(e) => handleParcelChange(index, 'parcel_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Số tờ bản đồ</label>
                          <input
                            type="text"
                            value={parcel.map_sheet_number || ''}
                            onChange={(e) => handleParcelChange(index, 'map_sheet_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Diện tích (m²)</label>
                          <input
                            type="number"
                            value={parcel.area || ''}
                            onChange={(e) => handleParcelChange(index, 'area', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Loại đất</label>
                          <input
                            type="text"
                            value={parcel.land_type || ''}
                            onChange={(e) => handleParcelChange(index, 'land_type', e.target.value)}
                            placeholder="VD: ONT, CLN..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Xã/Phường</label>
                          <CustomSelect
                            value={parcel.address_commune_ward || ''}
                            onChange={(val) => handleParcelChange(index, 'address_commune_ward', val)}
                            placeholder="-- Chọn Xã/Phường --"
                            options={wardOptions.map((ward) => ({ value: ward, label: ward }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tỉnh/Thành phố</label>
                          <input
                            type="text"
                            value={parcel.address_district_city || 'Thành phố Đà Nẵng'}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  File đã chọn: <span className="font-medium break-all">{drawingFile.name}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4 pb-4 sm:pb-0 sticky bottom-0 bg-white border-t border-gray-100 sm:border-0 p-4 sm:p-0 -mx-4 sm:mx-0 z-10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-accent text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors font-medium"
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

