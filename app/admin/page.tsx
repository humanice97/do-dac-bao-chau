'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { createClient, Project } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#1E40AF', '#F97316', '#10B981', '#F59E0B', '#EF4444']

const statusLabels: { [key: string]: string } = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  has_result: 'Đã có kết quả',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRevenue: 0,
    totalEngineerShare: 0,
    pendingProjects: 0,
    lateProjects: 0
  })
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const isLate = (project: Project) => {
    if (project.status === 'completed' || project.status === 'cancelled') return false

    const startDate = new Date(project.start_date || project.created_at)
    const today = new Date()
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 30
  }

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const role = user.user_metadata?.role || 'engineer'

      let query = supabase.from('projects').select('*')

      if (role !== 'admin') {
        // Find engineer record for this user
        const { data: engineerData, error: engineerError } = await supabase
          .from('engineers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!engineerError && engineerData) {
          query = query.eq('engineer_id', engineerData.id)
        } else {
          // If no engineer profile linked, return empty data for engineer
          setStats({
            totalProjects: 0,
            totalRevenue: 0,
            totalEngineerShare: 0,
            pendingProjects: 0,
            lateProjects: 0
          })
          setMonthlyData([])
          setStatusData([])
          setIsLoading(false)
          return
        }
      }

      const { data: projects, error } = await query

      if (error) throw error

      const totalProjects = projects?.length || 0
      const totalRevenue = projects?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0
      const totalEngineerShare = projects?.reduce((sum, p) => sum + (p.engineer_share || 0), 0) || 0
      const pendingProjects = projects?.filter(p => p.status === 'pending').length || 0
      const lateProjects = projects?.filter(p => isLate(p)).length || 0

      setStats({
        totalProjects,
        totalRevenue,
        totalEngineerShare,
        pendingProjects,
        lateProjects
      })

      const monthly = projects?.reduce((acc: any, project) => {
        const month = new Date(project.created_at).toLocaleString('vi-VN', { month: 'short' })
        if (!acc[month]) acc[month] = { month, revenue: 0, count: 0 }
        acc[month].revenue += project.total_price || 0
        acc[month].count += 1
        return acc
      }, {})
      setMonthlyData(Object.values(monthly || {}))

      const status = projects?.reduce((acc: any, project) => {
        const status = project.status || 'unknown'
        if (!acc[status]) acc[status] = { name: statusLabels[status] || status, value: 0 }
        acc[status].value += 1
        return acc
      }, {})
      setStatusData(Object.values(status || {}))

    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const kpiCards = [
    {
      title: 'Tổng hồ sơ',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-blue-500'
    },
    {
      title: 'Doanh thu',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Chia sẻ người thực hiện',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalEngineerShare),
      icon: Users,
      color: 'bg-orange-500'
    },
    {
      title: 'Chờ xử lý',
      value: stats.pendingProjects,
      icon: Calendar,
      color: 'bg-yellow-500'
    },
    {
      title: 'Hồ sơ trễ',
      value: stats.lateProjects,
      icon: AlertTriangle,
      color: 'bg-red-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-secondary">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-secondary mb-6">Doanh thu theo tháng</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                <Bar dataKey="revenue" fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-secondary mb-6">Phân bố trạng thái</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
