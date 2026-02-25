'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Filter,
  Layers,
  User,
} from 'lucide-react'
import { createClient, Project, Engineer } from '@/lib/supabase'
import ProjectForm from '@/components/admin/ProjectForm'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusLabels: { [key: string]: string } = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  has_result: 'Đã có kết quả',
  completed: 'Hoàn thành (đã trả kết quả)',
  cancelled: 'Đã hủy'
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  has_result: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

const serviceLabels: { [key: string]: string } = {
  do_so_do: 'Đo đất cấp sổ đỏ',
  tach_thua: 'Đo tách thửa',
  hoan_cong: 'Đo hoàn công',
  ban_ve: 'Lập bản vẽ hiện trạng',
  cam_moc_toa_do: 'Đo cắm mốc theo tọa độ'
}

// Hàm định dạng ngày tháng dd/mm/yyyy
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Chưa cập nhật'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterService, setFilterService] = useState('all')
  const [filterEngineer, setFilterEngineer] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [userRole, setUserRole] = useState<string>('engineer')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, projectId: string | null }>({ isOpen: false, projectId: null })

  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
    fetchEngineers()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const role = user.user_metadata?.role || 'engineer'
      setUserRole(role)

      let query = supabase.from('projects').select('*').order('created_at', { ascending: false })

      if (role !== 'admin') {
        const { data: engineerData } = await supabase
          .from('engineers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (engineerData) {
          query = query.eq('engineer_id', engineerData.id)
        } else {
          setProjects([])
          setIsLoading(false)
          return
        }
      }

      const { data, error } = await query

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')

      if (error) throw error
      setEngineers(data || [])
    } catch (error) {
      console.error('Error fetching engineers:', error)
    }
  }

  const getEngineerName = (engineerId: string) => {
    const engineer = engineers.find(e => e.id === engineerId)
    return engineer?.name || 'Chưa phân công'
  }

  // Kiểm tra hồ sơ có trễ không (quá 30 ngày từ ngày bắt đầu)
  const isLate = (project: Project) => {
    if (project.status === 'completed' || project.status === 'cancelled') return false

    const startDate = new Date(project.start_date || project.created_at)
    const today = new Date()
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 30
  }

  const showToast = (message: string) => {
    toast.success(message)
  }

  const confirmDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, projectId: id })
  }

  const handleDelete = async () => {
    if (!deleteConfirmation.projectId) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteConfirmation.projectId)

      if (error) throw error

      setDeleteConfirmation({ isOpen: false, projectId: null })
      fetchProjects()

      showToast('Đã xóa hồ sơ thành công!')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Có lỗi xảy ra khi xóa hồ sơ.')
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingProject(null)
    setIsFormOpen(true)
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesService = filterService === 'all' || project.service_type === filterService
    const matchesEngineer = filterEngineer === 'all' || project.engineer_id === filterEngineer
    return matchesSearch && matchesStatus && matchesService && matchesEngineer
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-secondary">Quản lý hồ sơ</h1>
        {userRole === 'admin' && (
          <Button
            onClick={handleAddNew}
            className="bg-accent hover:bg-orange-600 text-white h-11 px-4 gap-2 text-base rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Thêm hồ sơ
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc mã hồ sơ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 w-full transition-shadow focus-visible:ring-primary"
          />
        </div>
        <div className="flex flex-wrap lg:flex-nowrap gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-12 w-[180px] bg-white border-gray-200 text-gray-700">
              <div className="flex items-center gap-2 truncate text-left pr-2 w-full">
                <span className="flex-shrink-0 text-gray-500"><Filter className="w-4 h-4" /></span>
                <div className="truncate flex-1 text-left"><SelectValue placeholder="Tất cả trạng thái" /></div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="h-12 w-[220px] bg-white border-gray-200 text-gray-700">
              <div className="flex items-center gap-2 truncate text-left pr-2 w-full">
                <span className="flex-shrink-0 text-gray-500"><Layers className="w-4 h-4" /></span>
                <div className="truncate flex-1 text-left"><SelectValue placeholder="Tất cả dịch vụ" /></div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dịch vụ</SelectItem>
              {Object.entries(serviceLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {userRole === 'admin' && (
            <div className="min-w-[200px]">
              <Select value={filterEngineer} onValueChange={setFilterEngineer}>
                <SelectTrigger className="h-12 w-[220px] bg-white border-gray-200 text-gray-700">
                  <div className="flex items-center gap-2 truncate text-left pr-2 w-full">
                    <span className="flex-shrink-0 text-gray-500"><User className="w-4 h-4" /></span>
                    <div className="truncate flex-1 text-left"><SelectValue placeholder="Tất cả người thực hiện" /></div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả người thực hiện</SelectItem>
                  {engineers.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[1100px]">
            <TableHeader className="bg-gray-50 border-b border-gray-100">
              <TableRow>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Mã hồ sơ</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Tên Khách hàng</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Dịch vụ</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Ngày tiếp nhận</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Ngày trả KQ</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Người thực hiện</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Bản vẽ</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Tổng thu</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700">Chia sẻ %</TableHead>
                <TableHead className="py-4 px-4 font-semibold text-gray-700 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <TableCell className="py-4 px-4 font-medium text-primary">
                    <div className="flex items-center gap-2 max-w-[150px] truncate">
                      {project.code}
                      {isLate(project) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-medium leading-none shrink-0 border border-red-200/50 shadow-sm">
                          <AlertTriangle className="w-3 h-3" />
                          Trễ
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="max-w-[180px]">
                      <p className="font-medium text-secondary truncate">{project.customer_name}</p>
                      <p className="text-sm text-gray-500">{project.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-600 max-w-[180px] truncate">
                    {serviceLabels[project.service_type] || project.service_type}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${statusColors[project.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {statusLabels[project.status] || project.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">
                    {formatDate(project.received_date)}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">
                    {formatDate(project.result_date)}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">
                    {getEngineerName(project.engineer_id)}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-600">
                    {project.drawing_url ? (
                      <a
                        href={project.drawing_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-sm border border-primary/10 transition-all whitespace-nowrap"
                      >
                        File PDF
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">Chưa có</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-medium whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.total_price || 0)}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-medium whitespace-nowrap text-orange-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      (project.status === 'completed' || project.status === 'has_result') ? (project.total_price || 0) * 0.2 : 0
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(project)}
                        className="text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors h-8 w-8"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {userRole === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(project.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors h-8 w-8"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {/* Total Row */}
              {filteredProjects.length > 0 && (
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableCell colSpan={8} className="py-4 px-4 font-bold text-right text-gray-700">
                    Tổng cộng:
                  </TableCell>
                  <TableCell className="py-4 px-4 font-bold whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      filteredProjects.reduce((sum, p) => sum + (p.total_price || 0), 0)
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4 font-bold whitespace-nowrap text-orange-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      filteredProjects.reduce((sum, p) => sum + ((p.status === 'completed' || p.status === 'has_result') ? (p.total_price || 0) * 0.2 : 0), 0)
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy hồ sơ nào</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchProjects()
          showToast(editingProject ? 'Đã cập nhật hồ sơ thành công!' : 'Đã thêm hồ sơ thành công!')
        }}
        editingProject={editingProject}
        userRole={userRole}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setDeleteConfirmation({ isOpen: false, projectId: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Bạn có chắc chắn muốn xóa hồ sơ này không? Hành động này không thể hoàn tác và tất cả thửa đất liên quan cũng sẽ bị xóa.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, projectId: null })}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Xóa hồ sơ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
