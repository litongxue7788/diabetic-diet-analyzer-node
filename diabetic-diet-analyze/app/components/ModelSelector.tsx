'use client'

import { useState, useEffect } from 'react'
import { Brain } from 'lucide-react'

interface Model {
  id: string
  name: string
  description: string
  provider: string
  status: 'available' | 'coming_soon'
}

interface ModelSelectorProps {
  selectedModel: string
  onModelSelect: (modelId: string) => void
}

export default function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      if (data.success) {
        setModels(data.models)
      }
    } catch (error) {
      console.error('获取模型失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="w-6 h-6 text-green-600" />
          选择AI模型
        </h3>
        <div className="animate-pulse space-y-2">
          <div className="h-14 bg-gray-200 rounded-xl"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Brain className="w-6 h-6 text-green-600" />
        选择AI模型
      </h3>

      <div className="relative">
        <select
          value={selectedModel}
          onChange={(e) => onModelSelect(e.target.value)}
          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all appearance-none cursor-pointer font-medium shadow-sm"
          style={{ backgroundImage: 'none' }} 
        >
          {models.map((model) => (
            <option 
              key={model.id} 
              value={model.id}
              disabled={model.status !== 'available'}
              className="py-2"
            >
              {model.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {selectedModel && (
        <div className="p-5 bg-green-50 rounded-xl border border-green-100">
          <p className="text-base text-gray-800 font-medium mb-1">
             当前选择: {models.find(m => m.id === selectedModel)?.name}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {models.find(m => m.id === selectedModel)?.description}
          </p>
        </div>
      )}
    </div>
  )
}
