'use client'

import { useEffect, useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface HistoryRecord {
  timestamp: number
  net_carbs: number
  calories: number
  risk_level: string
}

export default function DietHistoryChart() {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = localStorage.getItem('diet_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        parsed.sort((a: HistoryRecord, b: HistoryRecord) => a.timestamp - b.timestamp)
        setHistory(parsed.slice(-30))
      }
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }, [])

  // Listen for storage events (when new analysis is added)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('diet_history')
        if (stored) {
           const parsed = JSON.parse(stored)
           parsed.sort((a: HistoryRecord, b: HistoryRecord) => a.timestamp - b.timestamp)
           setHistory(parsed.slice(-30))
        }
      } catch (e) {}
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const analysis = useMemo(() => {
    if (history.length === 0) return null
    const totalCarbs = history.reduce((sum, item) => sum + item.net_carbs, 0)
    const avgCarbs = Math.round(totalCarbs / history.length)
    const highRiskCount = history.filter(h => h.risk_level === '高').length
    const trend = history.length >= 2 
      ? history[history.length - 1].net_carbs - history[history.length - 2].net_carbs 
      : 0
    return { avgCarbs, highRiskCount, trend: parseFloat(trend.toFixed(1)), count: history.length }
  }, [history])

  if (!isMounted) return null

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>
        <p className="text-gray-400 text-sm">暂无数据，分析一次后自动生成</p>
      </div>
    )
  }

  const chartData = history.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    '净碳水': item.net_carbs,
    '热量': item.calories
  }))

  return (
    <div className="w-full">
      {/* Mini Metrics */}
      {analysis && (
        <div className="flex justify-between gap-2 mb-4 text-xs">
           <div className="flex-1 bg-green-50 p-2 rounded-lg text-center border border-green-100">
             <div className="text-green-800/60 mb-1">平均碳水</div>
             <div className="font-bold text-green-800 text-lg">{analysis.avgCarbs}g</div>
           </div>
           <div className="flex-1 bg-red-50 p-2 rounded-lg text-center border border-red-100">
             <div className="text-red-800/60 mb-1">高风险</div>
             <div className="font-bold text-red-800 text-lg">{analysis.highRiskCount}次</div>
           </div>
           <div className="flex-1 bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
             <div className="text-gray-500 mb-1">波动</div>
             <div className={`font-bold text-lg ${analysis.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
               {analysis.trend > 0 ? '+' : ''}{analysis.trend}
             </div>
           </div>
        </div>
      )}

      <div className="h-[200px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#9CA3AF' }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.split(' ')[1] || v}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" hide />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            
            <ReferenceLine yAxisId="left" y={60} label={{ value: '上限', position: 'insideBottomRight', fontSize: 10, fill: '#EF4444' }} stroke="#FECACA" strokeDasharray="3 3" />

            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="净碳水" 
              name="净碳水(g)"
              stroke="#769152" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#769152', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="热量" 
              name="热量(kcal)"
              stroke="#F59E0B" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {chartData.length > 0 && (
        <div className="mt-2 flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#769152]"></span>
            <span className="text-gray-600">净碳水</span>
            <span className="font-bold text-gray-900">
              {chartData[chartData.length - 1]['净碳水']}g
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
            <span className="text-gray-600">热量</span>
            <span className="font-bold text-gray-900">
              {chartData[chartData.length - 1]['热量']}kcal
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
