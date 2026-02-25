'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { X, User, Phone, MapPin, FileText, DollarSign, Calendar as CalendarIcon, UserCircle, Layers, Activity, FileCheck, UploadCloud, Trash2 } from 'lucide-react'
import { createClient, Project, Engineer, LandParcel } from '@/lib/supabase'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

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
  { value: 'reviewing', label: 'Đang trình thẩm định' },
  { value: 'has_result', label: 'Đã có kết quả' },
  { value: 'completed', label: 'Hoàn thành (đã trả kết quả)' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const wardOptions = [
  'Xã Điện Bàn Tây',
  'Xã Gò Nổi',
  'Phường An Thắng',
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
  const [landParcel, setLandParcel] = useState<Partial<LandParcel>>({
    parcel_number: '',
    map_sheet_number: '',
    area: 0,
    land_type: '',
    address_commune_ward: '',
    address_district_city: 'Thành phố Đà Nẵng'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const [removeExistingDrawing, setRemoveExistingDrawing] = useState(false)

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
      fetchLandParcel(editingProject.id)
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
      setRemoveExistingDrawing(false)
      setLandParcel({
        parcel_number: '',
        map_sheet_number: '',
        area: 0,
        land_type: '',
        address_commune_ward: '',
        address_district_city: 'Thành phố Đà Nẵng'
      })
    }
  }, [editingProject, isOpen])

  const fetchEngineers = async () => {
    const { data } = await supabase.from('engineers').select('*')
    if (data) setEngineers(data)
  }

  const fetchLandParcel = async (projectId: string) => {
    const { data } = await supabase.from('land_parcels').select('*').eq('project_id', projectId).single()
    if (data) {
      setLandParcel(data)
    } else {
      setLandParcel({
        parcel_number: '',
        map_sheet_number: '',
        area: 0,
        land_type: '',
        address_commune_ward: '',
        address_district_city: 'Thành phố Đà Nẵng'
      })
    }
  }

  const handleParcelChange = (field: keyof LandParcel, value: string | number) => {
    setLandParcel(prev => ({ ...prev, [field]: value }))
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
    setFileError('')

    try {
      let drawingUrl = editingProject?.drawing_url || null

      // Xóa file cũ khỏi Storage nếu user chọn xóa HOẶC nếu user đang thay thế bằng một file mới
      if (drawingUrl && (removeExistingDrawing || drawingFile)) {
        try {
          // Lấy path tương đối của file từ public URL đầy đủ
          const urlParts = drawingUrl.split('/project-drawings/')
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1]
            await supabase.storage.from('project-drawings').remove([oldFilePath])
          }
        } catch (err) {
          console.error('Error deleting old file from storage:', err)
          // Có lỗi xóa file cũ trên storage thì cũng không throw catch để chặn tiến trình update database
        }
      }

      if (removeExistingDrawing && !drawingFile) {
        // Nếu user chọn xóa file mặt định và không up file mới
        drawingUrl = null
      }

      // Upload PDF/DGN bản vẽ nếu có file mới được chọn
      if (drawingFile) {
        const fileExt = drawingFile.name.split('.').pop()?.toLowerCase() || ''
        const originalName = drawingFile.name.substring(0, drawingFile.name.lastIndexOf('.')) || 'drawing'
        // Thay thế các ký tự đặc biệt và khoảng trắng bằng gạch nối để link thân thiện hơn
        const safeName = originalName.replace(/[^a-zA-Z0-9-]/g, '-')
        const fileName = `${safeName}-${Date.now()}.${fileExt}`
        const filePath = `drawings/${fileName}`

        const contentType = fileExt === 'pdf' ? 'application/pdf' : 'application/octet-stream'

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-drawings')
          .upload(filePath, drawingFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: contentType,
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

      // Handle Land Parcel
      if (projectId) {
        // Delete existing ones first
        if (editingProject) {
          await supabase.from('land_parcels').delete().eq('project_id', projectId)
        }

        // Insert current one if it has at least some data
        if (landParcel.parcel_number || landParcel.map_sheet_number) {
          const parcelToInsert = {
            ...landParcel,
            project_id: projectId
          }
          // Remove id if it exists from previous fetch so we can insert cleanly
          delete parcelToInsert.id

          const { error: parcelError } = await supabase.from('land_parcels').insert([parcelToInsert])
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] h-[95vh] sm:h-[90vh] overflow-hidden w-full gap-0 p-0 sm:rounded-2xl rounded-t-2xl flex flex-col [&>button:last-child]:hidden">
        <DialogHeader className="sticky top-0 z-20 bg-white px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg sm:text-xl font-bold text-secondary text-left mt-0">
            {editingProject ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}
          </DialogTitle>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mt-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </DialogHeader>
        <DialogDescription className="sr-only">Biểu mẫu quản lý hồ sơ</DialogDescription>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-5">
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
                  <Input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    className="pl-12 h-12"
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
                  <Input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    required
                    className="pl-12 h-12"
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
                <Select value={String(provinceCode)} onValueChange={(val) => {
                  setProvinceCode(Number(val) || '')
                  setWardCode('')
                }}>
                  <SelectTrigger className="h-12 w-full text-gray-700 bg-white border-gray-200">
                    <div className="truncate flex-1 text-left"><SelectValue placeholder="-- Tỉnh/Thành phố --" /></div>
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(p => (
                      <SelectItem key={p.code} value={String(p.code)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(wardCode)} onValueChange={(val) => setWardCode(Number(val) || '')} disabled={!provinceCode}>
                  <SelectTrigger className="h-12 w-full text-gray-700 bg-white border-gray-200">
                    <div className="truncate flex-1 text-left"><SelectValue placeholder="-- Xã/Phường --" /></div>
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map(w => (
                      <SelectItem key={w.code} value={String(w.code)}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="pl-12 h-12"
                  placeholder="Số nhà, đường... (hoặc để nguyên địa chỉ cũ nếu có)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại dịch vụ
              </label>
              <Select value={formData.service_type} onValueChange={(val) => setFormData({ ...formData, service_type: val })}>
                <SelectTrigger className="h-12 w-full text-gray-700 bg-white border-gray-200">
                  <div className="flex items-center gap-2 truncate text-left pr-2 w-full">
                    <span className="flex-shrink-0 text-gray-400"><Layers className="w-5 h-5" /></span>
                    <div className="truncate flex-1 text-left"><SelectValue placeholder="Chọn dịch vụ" /></div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tiếp nhận <span className="text-xs text-gray-400"></span>
                </label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal pl-4",
                          !formData.received_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                        {formData.received_date ? format(parseISO(formData.received_date), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.received_date ? parseISO(formData.received_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleReceivedDateChange(format(date, 'yyyy-MM-dd'))
                          }
                        }}
                        locale={vi}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tự động tính ngày trả kết quả sau 30 ngày
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày trả kết quả <span className="text-xs text-gray-400"></span>
                </label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal pl-4",
                          !formData.result_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                        {formData.result_date ? format(parseISO(formData.result_date), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.result_date ? parseISO(formData.result_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, result_date: format(date, 'yyyy-MM-dd') })
                          }
                        }}
                        locale={vi}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="h-12 w-full text-gray-700 bg-white border-gray-200">
                    <div className="flex items-center gap-2 truncate text-left pr-2 w-full">
                      <span className="flex-shrink-0 text-gray-400"><Activity className="w-5 h-5" /></span>
                      <div className="truncate flex-1 text-left"><SelectValue placeholder="Chọn trạng thái" /></div>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng giá (VNĐ)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    value={formData.total_price}
                    onChange={(e) =>
                      setFormData({ ...formData, total_price: Number(e.target.value) })
                    }
                    min="0"
                    disabled={userRole !== 'admin'}
                    className="pl-12 h-12"
                    placeholder="Nhập tổng giá"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người thực hiện
              </label>
              <Select value={formData.engineer_id || 'none'} onValueChange={(val) => setFormData({ ...formData, engineer_id: val === 'none' ? '' : val })} disabled={userRole !== 'admin'}>
                <SelectTrigger className="h-12 w-full text-gray-700 bg-white border-gray-200">
                  <div className="flex items-center gap-2 truncate text-left pr-2 w-full">
                    <span className="flex-shrink-0 text-gray-400"><UserCircle className="w-5 h-5" /></span>
                    <div className="truncate flex-1 text-left"><SelectValue placeholder="-- Chọn người thực hiện --" /></div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Chưa nhận việc --</SelectItem>
                  {engineers.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="pl-12 resize-none"
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>

            {/* Quản lý Thửa Đất */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary">Thông tin Thửa đất</h3>
              </div>

              <div className="relative bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-2 sm:mt-0">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số thửa</label>
                    <Input
                      type="text"
                      value={landParcel.parcel_number || ''}
                      onChange={(e) => handleParcelChange('parcel_number', e.target.value)}
                      className="bg-white h-9"
                      placeholder="Nhập số thửa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số tờ bản đồ</label>
                    <Input
                      type="text"
                      value={landParcel.map_sheet_number || ''}
                      onChange={(e) => handleParcelChange('map_sheet_number', e.target.value)}
                      className="bg-white h-9"
                      placeholder="Nhập số tờ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Diện tích (m²)</label>
                    <Input
                      type="number"
                      value={landParcel.area || ''}
                      onChange={(e) => handleParcelChange('area', Number(e.target.value))}
                      className="bg-white h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Diện tích sàn (m²)</label>
                    <Input
                      type="number"
                      value={landParcel.floor_area || ''}
                      onChange={(e) => handleParcelChange('floor_area', Number(e.target.value))}
                      className="bg-white h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Loại đất</label>
                    <Input
                      type="text"
                      value={landParcel.land_type || ''}
                      onChange={(e) => handleParcelChange('land_type', e.target.value)}
                      placeholder="VD: ONT, CLN..."
                      className="bg-white h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Xứ đồng</label>
                    <Input
                      type="text"
                      value={landParcel.address || ''}
                      onChange={(e) => handleParcelChange('address', e.target.value)}
                      placeholder="VD: Đồng Bàu Hàm..."
                      className="bg-white h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Xã/Phường</label>
                    <Select value={landParcel.address_commune_ward || ''} onValueChange={(val) => handleParcelChange('address_commune_ward', val)}>
                      <SelectTrigger className="h-9 w-full text-gray-700 bg-white border-gray-200">
                        <div className="truncate flex-1 text-left"><SelectValue placeholder="-- Chọn Xã/Phường --" /></div>
                      </SelectTrigger>
                      <SelectContent>
                        {wardOptions.map((ward) => (
                          <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tỉnh/Thành phố</label>
                    <Input
                      type="text"
                      value={landParcel.address_district_city || 'Thành phố Đà Nẵng'}
                      readOnly
                      className="bg-gray-50 text-gray-500 cursor-not-allowed h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload bản vẽ PDF/DGN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bản vẽ (PDF hoặc DGN) <span className="text-gray-400 font-normal ml-1">(Tối đa 1MB)</span>
              </label>

              <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${fileError ? 'border-red-400 bg-red-50' :
                drawingFile ? 'border-primary/50 bg-primary/5' :
                  'border-gray-300 hover:border-primary/50 hover:bg-gray-50 bg-white'
                }`}>
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.dgn"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    if (file && file.size > 1024 * 1024) {
                      setFileError('Dung lượng file tải lên không được vượt quá 1MB')
                      e.target.value = ''
                      setDrawingFile(null)
                      return
                    }
                    setFileError('')
                    setDrawingFile(file)
                  }}
                />

                <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none">
                  {drawingFile ? (
                    <>
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileCheck className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{drawingFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{(drawingFile.size / 1024).toFixed(1)} KB</p>
                      </div>

                      {/* Nút Xóa File Đang Chọn (absolute) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setDrawingFile(null)
                          const fileInput = document.getElementById('file-upload') as HTMLInputElement
                          if (fileInput) fileInput.value = ''
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-gray-100/80 hover:bg-red-100 hover:text-red-500 text-gray-500 rounded-full transition-colors pointer-events-auto"
                        title="Hủy chọn file này"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-gray-100 rounded-full group-hover:bg-white transition-colors">
                        <UploadCloud className={`w-8 h-8 ${fileError ? 'text-red-500' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          <span className="text-primary hover:underline group-hover:text-primary">Bấm để chọn</span> hoặc kéo thả file
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Hỗ trợ định dạng PDF hoặc DGN</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {fileError && (
                <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                  <Activity className="w-4 h-4" /> {fileError}
                </p>
              )}

              {/* Box hiện thông báo file cũ đã upload */}
              {editingProject?.drawing_url && !drawingFile && (
                <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden text-sm">
                    <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    {removeExistingDrawing ? (
                      <span className="text-red-500 line-through truncate opacity-60">Đã lưu lệnh xóa file cũ</span>
                    ) : (
                      <span className="text-gray-600 truncate">
                        File hiện tại: <a href={editingProject.drawing_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Bản_Vẽ.pdf/dgn</a>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveExistingDrawing(!removeExistingDrawing)}
                    className={`ml-3 shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${removeExistingDrawing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                  >
                    {removeExistingDrawing ? (
                      'Hoàn tác'
                    ) : (
                      <><Trash2 className="w-3.5 h-3.5" /> Xóa file</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-3 p-4 sm:p-6 bg-white border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-6 text-gray-700 font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-6 bg-accent hover:bg-orange-600 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : editingProject ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

