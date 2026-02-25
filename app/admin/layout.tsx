import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AdminSidebar />
        <main className="flex-1 w-full min-w-0">
          <div className="p-4 lg:p-8 relative">
            <SidebarTrigger className="absolute top-4 left-4 lg:hidden" />
            <div className="lg:mt-0 mt-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  )
}
