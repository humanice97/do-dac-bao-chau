'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import { createClient, Project } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['var(--color-completed)', 'var(--color-processing)', 'var(--color-pending)', 'var(--color-has_result)', 'var(--color-cancelled)']

const statusLabels: { [key: string]: string } = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  has_result: 'Đã có kết quả',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
}

const barChartConfig = {
  actualRevenue: {
    label: "Thực tế",
    color: "hsl(var(--chart-2))", // Greenish
  },
  estimatedRevenue: {
    label: "Ước tính",
    color: "hsl(var(--chart-1))", // Blueish
  },
} satisfies ChartConfig

const pieChartConfig = {
  value: {
    label: "Số lượng",
  },
  pending: {
    label: "Chờ xử lý",
    color: "hsl(var(--chart-3))",
  },
  processing: {
    label: "Đang xử lý",
    color: "hsl(var(--chart-2))",
  },
  has_result: {
    label: "Đã có kết quả",
    color: "hsl(var(--chart-4))",
  },
  completed: {
    label: "Hoàn thành",
    color: "hsl(var(--chart-1))",
  },
  cancelled: {
    label: "Đã hủy",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    actualRevenue: 0,
    estimatedRevenue: 0,
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
    if (project.status === 'completed' || project.status === 'cancelled' || project.status === 'has_result') return false

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize today to midnight for comparison

    if (project.result_date) {
      const resultDate = new Date(project.result_date)
      resultDate.setHours(0, 0, 0, 0)
      return resultDate.getTime() < today.getTime()
    }

    // Fallback if no result_date is set (e.g. older projects)
    const startDate = new Date(project.start_date || project.created_at)
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
            actualRevenue: 0,
            estimatedRevenue: 0,
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

      const actualRevenue = projects?.filter(p => p.status === 'completed' || p.status === 'has_result')
        .reduce((sum, p) => sum + (p.total_price || 0), 0) || 0

      const estimatedRevenue = projects?.filter(p => p.status !== 'cancelled')
        .reduce((sum, p) => sum + (p.total_price || 0), 0) || 0

      const totalEngineerShare = actualRevenue * 0.2
      const pendingProjects = projects?.filter(p => p.status === 'pending').length || 0
      const lateProjects = projects?.filter(p => isLate(p)).length || 0

      setStats({
        totalProjects,
        actualRevenue,
        estimatedRevenue,
        totalEngineerShare,
        pendingProjects,
        lateProjects
      })

      const monthly = projects?.reduce((acc: any, project) => {
        // Use result_date for all revenue grouping if available, otherwise created_at
        const dateString = project.result_date ? project.result_date : project.created_at
        const month = new Date(dateString).toLocaleString('vi-VN', { month: 'short' })

        if (!acc[month]) acc[month] = { month, actualRevenue: 0, estimatedRevenue: 0, count: 0 }

        const isActual = project.status === 'completed' || project.status === 'has_result'

        if (isActual) {
          acc[month].actualRevenue += project.total_price || 0
        } else if (project.status !== 'cancelled') {
          acc[month].estimatedRevenue += project.total_price || 0
        }

        acc[month].count += 1
        return acc
      }, {})

      // Sort months chronologically if possible, or just use values
      setMonthlyData(Object.values(monthly || {}))

      const status = projects?.reduce((acc: any, project) => {
        const rawStatus = project.status || 'unknown'
        if (!acc[rawStatus]) acc[rawStatus] = { name: statusLabels[rawStatus] || rawStatus, value: 0, fill: `var(--color-${rawStatus})` }
        acc[rawStatus].value += 1
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
      title: 'Doanh thu Thực tế',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.actualRevenue),
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Doanh thu Ước tính',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.estimatedRevenue),
      icon: TrendingUp,
      color: 'bg-blue-400'
    },
    {
      title: 'Chia sẻ người thực hiện',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalEngineerShare),
      icon: Users,
      color: 'bg-orange-500'
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
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <card.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
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
        >
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
              <CardDescription>Biểu đồ doanh thu dự án</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
                <BarChart data={monthlyData} accessibilityLayer margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value as number)} />}
                  />
                  <Bar dataKey="actualRevenue" name="Thực tế" fill="var(--color-actualRevenue)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="estimatedRevenue" name="Ước tính" fill="var(--color-estimatedRevenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Phân bố trạng thái</CardTitle>
              <CardDescription>Tỉ lệ hồ sơ đang xử lý</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[350px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
