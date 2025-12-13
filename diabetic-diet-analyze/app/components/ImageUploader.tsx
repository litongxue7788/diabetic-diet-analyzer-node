'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Camera } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onImageSelect(file)
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    // 可以通过onImageSelect传递null来清除，但这里我们假设需要重新选择
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
          <img
            src={preview}
            alt="预览"
            className="w-full h-64 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            // 添加 capture="environment" 允许移动端直接调用后置摄像头，但为了兼顾从相册选，通常不强制 capture
            // 在微信小程序 webview 或现代移动浏览器中，不加 capture 默认会弹出 "拍照/相册" 选择菜单
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="image-upload"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-600 border-2 border-green-100">
                 <Camera className="w-10 h-10" />
               </div>
            </div>
            
            <div>
              <label 
                htmlFor="image-upload"
                className="text-xl font-bold text-gray-800"
              >
                拍照或上传图片
              </label>
              <p className="text-gray-500 mt-2 text-base">点击拍摄餐食，自动分析营养</p>
            </div>
            
            <p className="text-sm text-gray-400">
              支持 JPG、PNG、WEBP，最大 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
