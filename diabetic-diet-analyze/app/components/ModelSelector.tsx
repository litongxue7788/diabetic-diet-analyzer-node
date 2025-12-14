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

      <div className="flex flex-wrap items-center gap-4">
        {models.map((model) => {
          const active = selectedModel === model.id
          const disabled = model.status !== 'available'
          return (
            <button
              key={model.id}
              onClick={() => onModelSelect(model.id)}
              disabled={disabled}
              className={`w-16 h-16 rounded-full border-2 transition-all shadow-md flex items-center justify-center text-center ${
                active ? 'bg-[#769152] text-white border-[#6F8D45] shadow-lg' : 'bg-white text-gray-700 border-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <span className="text-[11px] font-bold leading-tight px-2">
                {model.name}
              </span>
            </button>
          )
        })}
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
