'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Phone, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { createClient, Engineer } from '@/lib/supabase'
import EngineerForm from '@/components/admin/EngineerForm'
import { toast } from 'sonner'

export default function EngineersPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, engineerId: string | null }>({ isOpen: false, engineerId: null })


  const supabase = createClient()

  useEffect(() => {
    fetchEngineers()
  }, [])

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEngineers(data || [])
    } catch (error) {
      console.error('Error fetching engineers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (message: string) => {
    toast.success(message)
  }

  const confirmDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, engineerId: id })
  }

  const handleDelete = async () => {
    if (!deleteConfirmation.engineerId) return

    try {
      const { error } = await supabase
        .from('engineers')
        .delete()
        .eq('id', deleteConfirmation.engineerId)

      if (error) throw error

      setDeleteConfirmation({ isOpen: false, engineerId: null })
      fetchEngineers()

      showToast('Đã xóa người thực hiện thành công!')
    } catch (error) {
      console.error('Error deleting engineer:', error)
      toast.error('Có lỗi xảy ra khi xóa người thực hiện.')
    }
  }

  const handleEdit = (engineer: Engineer) => {
    setEditingEngineer(engineer)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingEngineer(null)
    setIsFormOpen(true)
  }

  const filteredEngineers = engineers.filter(engineer =>
    engineer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    engineer.phone?.includes(searchQuery)
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
        <h1 className="text-3xl font-bold text-secondary">Quản lý người thực hiện</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm người thực hiện
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm người thực hiện..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      {/* Engineers Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEngineers.map((engineer, index) => (
          <motion.div
            key={engineer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {engineer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(engineer)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(engineer.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-secondary text-lg mb-3">{engineer.name}</h3>

            <div className="space-y-2">
              {engineer.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{engineer.phone}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredEngineers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy người thực hiện nào</p>
        </div>
      )}

      {/* Form Modal */}
      <EngineerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchEngineers()
          showToast(editingEngineer ? 'Cập nhật người thực hiện thành công!' : 'Thêm người thực hiện thành công!')
        }}
        editingEngineer={editingEngineer}
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
              onClick={() => setDeleteConfirmation({ isOpen: false, engineerId: null })}
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
                Bạn có chắc chắn muốn xóa người thực hiện này không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, engineerId: null })}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
