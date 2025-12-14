'use client'

import React from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="max-w-sm w-full bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
            <h2 className="text-lg font-bold text-[#769152] mb-2">发生错误</h2>
            <p className="text-sm text-gray-600 mb-4">页面出现异常。你可以刷新重试。</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-[#769152] text-white rounded-full font-bold"
            >
              重新加载
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
