'use client'
import React, { useEffect, useState } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    console.error('Client-side error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-sm w-full bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
        <h2 className="text-lg font-bold text-[#769152] mb-2">发生错误</h2>
        <p className="text-sm text-gray-600 mb-4">页面出现异常。你可以刷新重试。</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#769152] text-white rounded-full font-bold"
          >
            重新加载
          </button>
          <button
            onClick={() => setShowDetail(v => !v)}
            className="px-4 py-2 border border-[#769152] text-[#769152] rounded-full font-bold"
          >
            {showDetail ? '隐藏详情' : '查看详情'}
          </button>
        </div>
        {showDetail && (
          <div className="mt-4 text-left">
            <div className="text-xs text-gray-500 mb-1">错误信息</div>
            <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-auto max-h-40 text-gray-800">
              {String(error?.message || '')}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
