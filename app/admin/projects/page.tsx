'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { createClient, Project, Engineer } from '@/lib/supabase'
import ProjectForm from '@/components/admin/ProjectForm'

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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
    fetchEngineers()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

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

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa hồ sơ này?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
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

  const filteredProjects = projects.filter(project =>
    project.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm hồ sơ
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc mã hồ sơ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Mã hồ sơ</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Khách hàng</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Dịch vụ</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Ngày tiếp nhận</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Ngày trả KQ</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Người thực hiện</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Bản vẽ</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Tổng giá</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="py-4 px-6 font-medium text-primary">
                    <div className="flex items-center gap-2">
                      {project.code}
                      {isLate(project) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Trễ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-secondary">{project.customer_name}</p>
                      <p className="text-sm text-gray-500">{project.customer_phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {serviceLabels[project.service_type] || project.service_type}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[project.status] || project.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {formatDate(project.received_date)}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {formatDate(project.result_date)}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {getEngineerName(project.engineer_id)}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {project.drawing_url ? (
                      <a
                        href={project.drawing_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        Xem PDF
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.total_price || 0)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
        onSuccess={fetchProjects}
        editingProject={editingProject}
      />
    </div>
  )
}
