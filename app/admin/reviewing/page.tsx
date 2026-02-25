'use client'

import { useEffect, useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { ClipboardCheck, FileDown, CheckSquare, RefreshCw } from 'lucide-react'
import { createClient, Project, Engineer, LandParcel } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// ─── helpers ────────────────────────────────────────────────────────────────
const formatDate = (d?: string | null) => {
    if (!d) return 'Chưa cập nhật'
    const date = new Date(d)
    return isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}

const formatCurrency = (v?: number | null) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0)

const serviceLabels: Record<string, string> = {
    do_so_do: 'Đo đất cấp sổ đỏ',
    tach_thua: 'Đo tách thửa',
    hoan_cong: 'Đo hoàn công',
    ban_ve: 'Lập bản vẽ hiện trạng',
    cam_moc_toa_do: 'Đo cắm mốc theo tọa độ',
}

// ─── component ──────────────────────────────────────────────────────────────
export default function ReviewingPage() {
    const [tab, setTab] = useState<'add' | 'list'>('add')
    const [processingProjects, setProcessingProjects] = useState<Project[]>([])
    const [reviewingProjects, setReviewingProjects] = useState<Project[]>([])
    const [landParcels, setLandParcels] = useState<LandParcel[]>([])
    const [engineers, setEngineers] = useState<Engineer[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const supabase = createClient()

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [{ data: eng }, { data: proc }, { data: rev }] = await Promise.all([
                supabase.from('engineers').select('*'),
                supabase.from('projects').select('*').eq('status', 'processing').order('created_at', { ascending: false }),
                supabase.from('projects').select('*').eq('status', 'reviewing').order('created_at', { ascending: false }),
            ])
            setEngineers(eng ?? [])
            setProcessingProjects(proc ?? [])
            const revProjects = rev ?? []
            setReviewingProjects(revProjects)

            // Fetch land parcels for reviewing projects
            if (revProjects.length > 0) {
                const revIds = revProjects.map(p => p.id)
                const { data: parcels } = await supabase
                    .from('land_parcels')
                    .select('*')
                    .in('project_id', revIds)
                setLandParcels(parcels ?? [])
            } else {
                setLandParcels([])
            }
        } catch (e) {
            console.error(e)
            toast.error('Không thể tải dữ liệu.')
        } finally {
            setIsLoading(false)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchData() }, [fetchData])

    const getEngineerName = (id?: string) =>
        engineers.find(e => e.id === id)?.name ?? '—'

    const getParcel = (projectId: string) =>
        landParcels.find(lp => lp.project_id === projectId)

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        if (selected.size === processingProjects.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(processingProjects.map(p => p.id)))
        }
    }

    const handleSubmitReviewing = async () => {
        if (selected.size === 0) {
            toast.error('Vui lòng chọn ít nhất một hồ sơ.')
            return
        }
        setIsSaving(true)
        try {
            const ids = Array.from(selected)
            const { error } = await supabase
                .from('projects')
                .update({ status: 'reviewing' })
                .in('id', ids)
            if (error) throw error
            toast.success(`Đã trình thẩm định ${ids.length} hồ sơ thành công!`)
            setSelected(new Set())
            await fetchData()
            setTab('list')
        } catch (e) {
            console.error(e)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleExportExcel = () => {
        if (reviewingProjects.length === 0) {
            toast.error('Không có hồ sơ nào để xuất.')
            return
        }

        const rows = reviewingProjects.map((p, i) => {
            const parcel = getParcel(p.id)
            return {
                'STT': i + 1,
                'Mã hồ sơ': p.code,
                'Tên khách hàng': p.customer_name,
                'Số điện thoại': p.customer_phone,
                'Địa chỉ': p.address,
                'Loại dịch vụ': serviceLabels[p.service_type] ?? p.service_type,
                'Số thửa': parcel?.parcel_number ?? '',
                'Số tờ bản đồ': parcel?.map_sheet_number ?? '',
                'Xứ đồng': parcel?.address ?? '',
                'Diện tích (m²)': parcel?.area ?? '',
                'Loại đất': parcel?.land_type ?? '',
                'Xã/Phường': parcel?.address_commune_ward ?? '',
                'Quận/Huyện': parcel?.address_district_city ?? '',
                'Ngày tiếp nhận': formatDate(p.received_date),
                'Ngày trả KQ': formatDate(p.result_date),
                'Người thực hiện': getEngineerName(p.engineer_id),
                'Tổng thu': p.total_price ?? 0,
                'Ghi chú': p.notes ?? '',
            }
        })

        const ws = XLSX.utils.json_to_sheet(rows)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Trình thẩm định')
        ws['!cols'] = [
            { wch: 5 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 28 },
            { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 12 },
            { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
            { wch: 20 }, { wch: 16 }, { wch: 24 },
        ]

        const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')
        XLSX.writeFile(wb, `TrinhThamDinh_${dateStr}.xlsx`)
        toast.success('Đã xuất file Excel thành công!')
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary flex items-center gap-2">
                        <ClipboardCheck className="w-8 h-8 text-indigo-600" />
                        Trình thẩm định
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý hồ sơ đang trong quá trình trình thẩm định</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="gap-2 h-10">
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setTab('add')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'add'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Thêm hồ sơ trình thẩm định
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            {processingProjects.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setTab('list')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'list'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Danh sách đang trình
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
                            {reviewingProjects.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* ── Tab 1 ── */}
            {tab === 'add' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Chọn các hồ sơ <span className="font-semibold text-blue-700">Đang xử lý</span> để chuyển sang trạng thái trình thẩm định.
                        </p>
                        {selected.size > 0 && (
                            <Button
                                onClick={handleSubmitReviewing}
                                disabled={isSaving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            >
                                <ClipboardCheck className="w-4 h-4" />
                                {isSaving ? 'Đang xử lý...' : `Trình thẩm định (${selected.size})`}
                            </Button>
                        )}
                    </div>

                    {processingProjects.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Không có hồ sơ nào đang xử lý</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table className="min-w-[900px]">
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="w-12 py-4 px-4">
                                                <input type="checkbox"
                                                    checked={selected.size === processingProjects.length && processingProjects.length > 0}
                                                    onChange={toggleAll}
                                                    className="w-4 h-4 rounded accent-indigo-600"
                                                />
                                            </TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Mã hồ sơ</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Tên khách hàng</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Dịch vụ</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Ngày tiếp nhận</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Ngày trả KQ</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Người thực hiện</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Tổng thu</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {processingProjects.map(p => (
                                            <TableRow
                                                key={p.id}
                                                className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${selected.has(p.id) ? 'bg-indigo-50' : ''}`}
                                                onClick={() => toggleSelect(p.id)}
                                            >
                                                <TableCell className="py-4 px-4" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                                                        className="w-4 h-4 rounded accent-indigo-600" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4 font-medium text-primary">{p.code}</TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <p className="font-medium text-secondary">{p.customer_name}</p>
                                                    <p className="text-xs text-gray-400">{p.customer_phone}</p>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-gray-600 text-sm">{serviceLabels[p.service_type] ?? p.service_type}</TableCell>
                                                <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">{formatDate(p.received_date)}</TableCell>
                                                <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">{formatDate(p.result_date)}</TableCell>
                                                <TableCell className="py-4 px-4 text-gray-600">{getEngineerName(p.engineer_id)}</TableCell>
                                                <TableCell className="py-4 px-4 font-medium whitespace-nowrap">{formatCurrency(p.total_price)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab 2 ── */}
            {tab === 'list' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Tổng cộng <span className="font-semibold text-indigo-700">{reviewingProjects.length}</span> hồ sơ đang trình thẩm định.
                        </p>
                        <Button
                            onClick={handleExportExcel}
                            disabled={reviewingProjects.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            <FileDown className="w-4 h-4" />
                            Xuất Excel
                        </Button>
                    </div>

                    {reviewingProjects.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Chưa có hồ sơ nào đang trình thẩm định</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table className="min-w-[1400px]">
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Mã hồ sơ</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Tên khách hàng</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Dịch vụ</TableHead>
                                            <TableHead className="py-4 px-3 font-semibold text-indigo-700 text-center bg-indigo-50">Số thửa</TableHead>
                                            <TableHead className="py-4 px-3 font-semibold text-indigo-700 text-center bg-indigo-50">Tờ bản đồ</TableHead>
                                            <TableHead className="py-4 px-3 font-semibold text-indigo-700 bg-indigo-50">Xứ đồng</TableHead>
                                            <TableHead className="py-4 px-3 font-semibold text-indigo-700 text-center bg-indigo-50">Diện tích</TableHead>
                                            <TableHead className="py-4 px-3 font-semibold text-indigo-700 bg-indigo-50">Loại đất</TableHead>
                                            <TableHead className="py-4 px-3 font-semibold text-indigo-700 bg-indigo-50">Xã/Phường</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Ngày TN</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Người TH</TableHead>
                                            <TableHead className="py-4 px-4 font-semibold text-gray-700">Tổng thu</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reviewingProjects.map(p => {
                                            const parcel = getParcel(p.id)
                                            return (
                                                <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <TableCell className="py-4 px-4 font-medium text-primary">{p.code}</TableCell>
                                                    <TableCell className="py-4 px-4">
                                                        <p className="font-medium text-secondary">{p.customer_name}</p>
                                                        <p className="text-xs text-gray-400">{p.customer_phone}</p>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-4 text-gray-600 text-sm">{serviceLabels[p.service_type] ?? p.service_type}</TableCell>
                                                    <TableCell className="py-3 px-3 text-center bg-indigo-50/30 font-semibold text-indigo-800">{parcel?.parcel_number ?? '—'}</TableCell>
                                                    <TableCell className="py-3 px-3 text-center bg-indigo-50/30 text-gray-700">{parcel?.map_sheet_number ?? '—'}</TableCell>
                                                    <TableCell className="py-3 px-3 bg-indigo-50/30 text-gray-700 text-sm">{parcel?.address ?? '—'}</TableCell>
                                                    <TableCell className="py-3 px-3 text-center bg-indigo-50/30 text-gray-700 whitespace-nowrap">
                                                        {parcel?.area != null ? `${parcel.area} m²` : '—'}
                                                    </TableCell>
                                                    <TableCell className="py-3 px-3 bg-indigo-50/30 text-gray-700 text-sm">{parcel?.land_type ?? '—'}</TableCell>
                                                    <TableCell className="py-3 px-3 bg-indigo-50/30 text-gray-700 text-sm">{parcel?.address_commune_ward ?? '—'}</TableCell>
                                                    <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">{formatDate(p.received_date)}</TableCell>
                                                    <TableCell className="py-4 px-4 text-gray-600">{getEngineerName(p.engineer_id)}</TableCell>
                                                    <TableCell className="py-4 px-4 font-medium whitespace-nowrap">{formatCurrency(p.total_price)}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableCell colSpan={11} className="py-4 px-4 font-bold text-right text-gray-700">Tổng cộng:</TableCell>
                                            <TableCell className="py-4 px-4 font-bold whitespace-nowrap">
                                                {formatCurrency(reviewingProjects.reduce((s, p) => s + (p.total_price ?? 0), 0))}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
