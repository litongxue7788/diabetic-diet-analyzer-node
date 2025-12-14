'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Camera } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void
  children?: React.ReactNode
}

export default function ImageUploader({ onImageSelect, children }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('请选择图片文件（支持 JPG/PNG/WEBP）')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('图片大小不能超过 10MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      setErrorMsg(null)
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
    onImageSelect(null)
    setErrorMsg(null)
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden bg-black/5 w-full h-full group flex items-center justify-center border border-[#769152]/20">
          <img
            src={preview}
            alt="预览"
            className="w-full h-full object-contain"
          />
          <button
            onClick={handleRemove}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            id="image-replace"
            className="hidden"
          />
          <label
            htmlFor="image-replace"
            className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/85 text-[#769152] rounded-full border border-[#769152]/40 text-xs font-bold cursor-pointer"
          >
            更换照片
          </label>
          {children}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-4 transition-all w-full h-full flex items-center justify-center ${
            dragOver 
              ? 'border-[#769152] bg-green-50' 
              : 'border-[#C8D6BE] hover:border-[#769152] hover:bg-green-50/30'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Camera className="w-14 h-14 text-[#769152] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="image-upload"
          />
        </div>
      )}
      {errorMsg && (
        <div className="text-center text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {errorMsg}
        </div>
      )}
    </div>
  )
}
