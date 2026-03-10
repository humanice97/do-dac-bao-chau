'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Building2, Clock, XCircle, FileCheck, Award,
  AlertTriangle, Download, Eye, Phone, User, MapPin,
  Layers, FileText, Hash, Map
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const statusConfig: { [key: string]: { label: string; color: string; bg: string; icon: any } } = {
  pending:    { label: 'Chờ xử lý',                  color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200',  icon: Clock },
  processing: { label: 'Đang xử lý',                 color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: Clock },
  reviewing:  { label: 'Đang trình thẩm định',       color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: FileCheck },
  has_result: { label: 'Đã có kết quả',              color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: FileCheck },
  completed:  { label: 'Hoàn thành (đã trả kết quả)',color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: Award },
  cancelled:  { label: 'Đã hủy',                     color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: XCircle },
}

const serviceLabels: { [key: string]: string } = {
  do_so_do:       'Đo đất cấp sổ đỏ',
  tach_thua:      'Đo tách thửa',
  hoan_cong:      'Đo hoàn công',
  ban_ve:         'Lập bản vẽ hiện trạng',
  cam_moc_toa_do: 'Đo cắm mốc theo tọa độ',
}

type SearchMode = 'phone' | 'owner'

export default function TrackPage() {
  const [mode, setMode]           = useState<SearchMode>('phone')
  const [phone, setPhone]         = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [results, setResults]     = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')
  const [searched, setSearched]   = useState(false)

  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResults([])
    setSearched(false)

    try {
      let query = supabase
        .from('projects')
        .select(`
          id, code, customer_name, customer_phone, address, service_type,
          received_date, result_date, status, start_date, drawing_url,
          land_parcels (
            owner_name, parcel_number, map_sheet_number,
            area, floor_area, land_type, address, address_commune_ward, address_district_city
          )
        `)

      if (mode === 'phone') {
        query = query.eq('customer_phone', phone.trim())
      } else {
        // Tìm theo tên chủ trong bảng land_parcels → lấy project_id
        const { data: parcelData } = await supabase
          .from('land_parcels')
          .select('project_id')
          .ilike('owner_name', `%${ownerName.trim()}%`)

        if (!parcelData || parcelData.length === 0) {
          setError('Không tìm thấy hồ sơ nào với tên chủ sử dụng đất này.')
          setSearched(true)
          return
        }

        const projectIds = parcelData.map((p: any) => p.project_id)
        query = query.in('id', projectIds)
      }

      const { data, error: qErr } = await query.order('received_date', { ascending: false })

      if (qErr) throw qErr

      if (!data || data.length === 0) {
        setError(
          mode === 'phone'
            ? 'Không tìm thấy hồ sơ nào với số điện thoại này.'
            : 'Không tìm thấy hồ sơ nào với tên chủ sử dụng đất này.'
        )
      } else {
        setResults(data)
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
      setSearched(true)
    }
  }

  const isLate = (p: any) => {
    if (p.status === 'completed' || p.status === 'cancelled') return false
    const start = new Date(p.start_date || p.received_date)
    return Math.ceil((Date.now() - start.getTime()) / 86400000) > 30
  }

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('vi-VN') : 'Chưa xác định'

  const formatArea = (n: number | null) =>
    n ? `${n.toLocaleString('vi-VN')} m²` : '—'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-800 to-blue-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">

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
          <p className="text-blue-200">Hà Nam Thành - Hệ thống tra cứu online</p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-6 mb-6"
        >
          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
            <button
              type="button"
              onClick={() => { setMode('phone'); setResults([]); setError(''); setSearched(false) }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                ${mode === 'phone' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Phone className="w-4 h-4" />
              Số điện thoại
            </button>
            <button
              type="button"
              onClick={() => { setMode('owner'); setResults([]); setError(''); setSearched(false) }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                ${mode === 'owner' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" />
              Tên chủ sử dụng đất
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'phone' ? (
                <motion.div key="phone" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại đăng ký</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Nhập số điện thoại..."
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="owner" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ sử dụng đất</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                      placeholder="Nhập tên chủ sử dụng đất..."
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results.map((project, idx) => {
            const cfg = statusConfig[project.status] || statusConfig.pending
            const Icon = cfg.icon
            const parcel = Array.isArray(project.land_parcels) ? project.land_parcels[0] : project.land_parcels

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="bg-white rounded-2xl shadow-2xl p-6 mb-4"
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-semibold text-gray-500">{project.code}</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                    {cfg.label}
                  </div>
                </div>

                {isLate(project) && (
                  <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Hồ sơ đã trễ hạn (quá 30 ngày)
                  </div>
                )}

                {/* Info rows */}
                <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden mb-5">
                  {[
                    { icon: User,     label: 'Khách hàng',          value: project.customer_name },
                    { icon: Layers,   label: 'Dịch vụ',             value: serviceLabels[project.service_type] || project.service_type },
                    { icon: MapPin,   label: 'Địa chỉ thường trú',  value: project.address || '—' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                      <row.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-500 w-36 shrink-0">{row.label}</span>
                      <span className="text-sm font-medium text-gray-800 break-words">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-500 w-36 shrink-0">Ngày tiếp nhận</span>
                    <span className="text-sm font-medium text-gray-800">{formatDate(project.received_date)}</span>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-500 w-36 shrink-0">Ngày dự kiến trả KQ</span>
                    <span className="text-sm font-medium text-gray-800">{formatDate(project.result_date)}</span>
                  </div>
                </div>

                {/* Land parcel info */}
                {parcel && (
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Map className="w-4 h-4 text-primary" />
                      Thông tin thửa đất
                    </h3>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                      {parcel.owner_name && (
                        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100">
                          <User className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500 w-32 shrink-0">Chủ sử dụng đất</span>
                          <span className="text-sm font-semibold text-gray-800">{parcel.owner_name}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 divide-x divide-gray-100">
                        <div className="flex flex-col gap-0.5 px-4 py-2.5 border-b border-gray-100">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Hash className="w-3 h-3" />Số thửa</span>
                          <span className="text-sm font-semibold text-gray-800">{parcel.parcel_number || '—'}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 px-4 py-2.5 border-b border-gray-100">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Map className="w-3 h-3" />Tờ bản đồ</span>
                          <span className="text-sm font-semibold text-gray-800">{parcel.map_sheet_number || '—'}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 px-4 py-2.5 border-b border-gray-100">
                          <span className="text-xs text-gray-400">Diện tích</span>
                          <span className="text-sm font-semibold text-gray-800">{formatArea(parcel.area)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 px-4 py-2.5 border-b border-gray-100">
                          <span className="text-xs text-gray-400">Loại đất</span>
                          <span className="text-sm font-semibold text-gray-800">{parcel.land_type || '—'}</span>
                        </div>
                      </div>
                      {(parcel.address_commune_ward || parcel.address_district_city) && (
                        <div className="flex items-center gap-3 px-4 py-2.5">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500 w-32 shrink-0">Địa chỉ thửa đất</span>
                          <span className="text-sm text-gray-800">
                            {[parcel.address, parcel.address_commune_ward, parcel.address_district_city].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* File actions */}
                {project.drawing_url && (
                  <div className="flex gap-3">
                    <a
                      href={project.drawing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Xem trước
                    </a>
                    <a
                      href={project.drawing_url}
                      download
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent font-medium rounded-xl transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </a>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-blue-200 text-sm mt-8"
        >
          © 2025 Hà Nam Thành. Hotline: 0905.225.968
        </motion.p>
      </div>
    </div>
  )
}
