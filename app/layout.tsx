import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Đo Đạc Làm Sổ Đỏ Tại Đà Nẵng | Bảo Châu Survey',
  description:
    'Dịch vụ đo đất làm sổ đỏ, tách thửa, hoàn công tại Đà Nẵng. Kỹ sư có chứng chỉ hành nghề, 5 năm kinh nghiệm. Tư vấn miễn phí.',
  keywords:
    'đo đất Đà Nẵng, đo đất làm sổ đỏ Đà Nẵng, tách thửa Đà Nẵng, đo hoàn công, lập bản vẽ hiện trạng, dịch vụ đo đạc địa chính',
  authors: [{ name: 'Bảo Châu Survey' }],
  openGraph: {
    title: 'Đo Đạc Làm Sổ Đỏ Tại Đà Nẵng | Bảo Châu Survey',
    description:
      'Dịch vụ đo đất làm sổ đỏ, tách thửa, hoàn công tại Đà Nẵng. Kỹ sư có chứng chỉ hành nghề, 5 năm kinh nghiệm.',
    type: 'website',
    locale: 'vi_VN',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-background">
        {children}
      </body>
    </html>
  )
}

