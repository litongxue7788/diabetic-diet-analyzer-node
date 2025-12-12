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
        <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          选择AI模型
        </h3>
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        选择AI模型
      </h3>

      <select
        value={selectedModel}
        onChange={(e) => onModelSelect(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
      >
        {models.map((model) => (
          <option 
            key={model.id} 
            value={model.id}
            disabled={model.status !== 'available'}
          >
            {model.name} - {model.description}
          </option>
        ))}
      </select>

      {selectedModel && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            当前选择: <span className="font-medium">{models.find(m => m.id === selectedModel)?.name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {models.find(m => m.id === selectedModel)?.description}
          </p>
        </div>
      )}
    </div>
  )
}
