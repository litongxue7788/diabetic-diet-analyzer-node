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
  size?: number
}

export default function ModelSelector({ selectedModel, onModelSelect, size }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  const defaultModels: Model[] = [
    { id: 'doubao-vision', name: 'Doubao Vision', description: '豆包视觉', provider: 'Doubao', status: 'available' },
    { id: 'gemini-pro-vision', name: 'Gemini Vision', description: 'Google视觉', provider: 'Google', status: 'available' },
    { id: 'qwen-vl-plus', name: 'Qwen-VL-Plus', description: '通义千问视觉', provider: 'Ali', status: 'available' },
  ]

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      if (data.success) {
        setModels(data.models)
      } else {
         setModels(defaultModels)
      }
    } catch (error) {
      console.error('获取模型失败:', error)
      setModels(defaultModels)
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

      <div className="flex items-center justify-center">
        <SegmentedCircle
          models={models}
          selectedModel={selectedModel}
          onSelect={onModelSelect}
          size={size}
        />
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

function SegmentedCircle({
  models,
  selectedModel,
  onSelect,
}: {
  models: Model[]
  selectedModel: string
  onSelect: (id: string) => void
  size?: number
}) {
  const s = size || 220
  const cx = s / 2
  const cy = s / 2
  const rOuter = Math.round(s * 0.45)
  const rInner = Math.round(s * 0.25)
  const colors = ['#769152', '#8AA563', '#6F8D45', '#9BB274', '#5F7E3B', '#A9BC86']

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const xy = (r: number, angleDeg: number) => {
    const a = toRad(angleDeg)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const arc = (r: number, startDeg: number, endDeg: number) => {
    const large = endDeg - startDeg > 180 ? 1 : 0
    const s = xy(r, startDeg)
    const e = xy(r, endDeg)
    return `A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }
  const pathFor = (startDeg: number, endDeg: number) => {
    const sOuter = xy(rOuter, startDeg)
    const sInner = xy(rInner, endDeg)
    return `M ${sOuter.x} ${sOuter.y} ${arc(rOuter, startDeg, endDeg)} L ${sInner.x} ${sInner.y} ${arc(rInner, endDeg, startDeg)} Z`
  }

  const count = models.length || 1
  const step = 360 / count

  return (
    <svg width={size} height={size}>
      {models.map((m, i) => {
        const start = -90 + i * step
        const end = start + step
        const active = selectedModel === m.id
        const disabled = m.status !== 'available'
        const fill = active ? `url(#grad-${i})` : colors[i % colors.length]
        const mid = start + step / 2
        const tx = cx + Math.cos(toRad(mid)) * 78
        const ty = cy + Math.sin(toRad(mid)) * 78
        return (
          <g key={m.id} onClick={() => !disabled && onSelect(m.id)} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }} opacity={disabled ? 0.4 : 1}>
            <defs>
              <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A9BC86" />
                <stop offset="100%" stopColor={colors[i % colors.length]} />
              </linearGradient>
            </defs>
            <path d={pathFor(start, end)} fill={fill} stroke={active ? '#4B5E2D' : '#6F8D45'} strokeWidth={active ? 3 : 2} />
            <text x={tx} y={ty} fill={active ? '#ffffff' : '#1F2937'} fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
              {m.name}
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={rInner - 6} fill="#ffffff" stroke="#6F8D45" strokeWidth="2" />
      <text x={cx} y={cy} fill="#374151" fontSize="12" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
        {models.find(m => m.id === selectedModel)?.name || '选择模型'}
      </text>
    </svg>
  )
}
