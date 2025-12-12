import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '糖尿病膳食分析助手 - AI营养师',
  description: '使用AI分析食物图片，为糖尿病患者提供专业营养建议',
  keywords: ['糖尿病', '营养分析', 'AI', '健康饮食', '膳食管理'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          {children}
        </div>
      </body>
    </html>
  )
}
