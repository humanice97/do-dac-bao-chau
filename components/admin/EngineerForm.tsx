'use client'

import { useState, useEffect } from 'react'
import { X, User, Phone } from 'lucide-react'
import { createClient, Engineer } from '@/lib/supabase'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden w-full gap-0 p-0 sm:rounded-2xl rounded-t-2xl flex flex-col [&>button:last-child]:hidden">
        <DialogHeader className="sticky top-0 z-20 bg-white px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg sm:text-xl font-bold text-secondary text-left mt-0">
            {editingEngineer ? 'Chỉnh sửa kỹ sư' : 'Thêm kỹ sư mới'}
          </DialogTitle>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mt-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </DialogHeader>
        <DialogDescription className="sr-only">Biểu mẫu quản lý kỹ sư</DialogDescription>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden h-full max-h-[calc(100vh-[70px])]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="pl-12 h-12"
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
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-12 h-12"
                  placeholder="Nhập số điện thoại"
                />
              </div>
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
              {isLoading ? 'Đang lưu...' : editingEngineer ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

