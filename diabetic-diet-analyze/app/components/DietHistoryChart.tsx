'use client'

import { useEffect, useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react'

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
    // 从 localStorage 读取历史记录
    try {
      const stored = localStorage.getItem('diet_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        // 按时间排序
        parsed.sort((a: HistoryRecord, b: HistoryRecord) => a.timestamp - b.timestamp)
        // 只取最近30条
        setHistory(parsed.slice(-30))
      }
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }, [])

  const analysis = useMemo(() => {
    if (history.length === 0) return null

    const totalCarbs = history.reduce((sum, item) => sum + item.net_carbs, 0)
    const avgCarbs = Math.round(totalCarbs / history.length)
    const highRiskCount = history.filter(h => h.risk_level === '高').length
    const trend = history.length >= 2 
      ? history[history.length - 1].net_carbs - history[history.length - 2].net_carbs 
      : 0

    return {
      avgCarbs,
      highRiskCount,
      trend: parseFloat(trend.toFixed(1)),
      count: history.length
    }
  }, [history])

  if (!isMounted) return null

  // 如果没有数据，显示空状态而不是返回null
  if (history.length === 0) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 flex flex-col items-center justify-center space-y-4 py-16">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">暂无历史数据</h3>
        <p className="text-gray-500 text-center max-w-sm">
          完成第一次AI分析后，这里将自动展示您的饮食趋势图表和个性化建议。
        </p>
      </div>
    )
  }

  // 格式化图表数据
  const chartData = history.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    '净碳水': item.net_carbs,
    '热量': item.calories
  }))

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          饮食趋势分析
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          最近 {history.length} 次记录
        </span>
      </div>

      {/* 分析摘要 - 移动端垂直堆叠，大屏水平排列 */}
      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between sm:block">
            <div>
              <p className="text-sm text-gray-600">平均每餐净碳水</p>
              <p className="text-xs text-blue-600 mt-1 sm:hidden">
                {analysis.avgCarbs > 60 ? '⚠️ 偏高' : '✅ 良好'}
              </p>
            </div>
            <div className="text-right sm:text-left">
              <p className="text-2xl font-bold text-blue-700">{analysis.avgCarbs}g</p>
              <p className="text-xs text-blue-600 mt-1 hidden sm:block">
                {analysis.avgCarbs > 60 ? '⚠️ 平均摄入偏高' : '✅ 控制良好'}
              </p>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between sm:block">
            <div>
              <p className="text-sm text-gray-600">高风险餐次占比</p>
              <p className="text-xs text-orange-600 mt-1 sm:hidden">
                {analysis.highRiskCount} 次高风险
              </p>
            </div>
            <div className="text-right sm:text-left">
              <p className="text-2xl font-bold text-orange-700">
                {Math.round((analysis.highRiskCount / analysis.count) * 100)}%
              </p>
              <p className="text-xs text-orange-600 mt-1 hidden sm:block">
                {analysis.highRiskCount} 次高风险记录
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between sm:block">
            <div>
              <p className="text-sm text-gray-600">最近变化趋势</p>
              <p className="text-xs text-green-600 mt-1 sm:hidden">
                较上一餐
              </p>
            </div>
            <div className="text-right sm:text-left">
              <p className="text-2xl font-bold text-green-700">
                {analysis.trend > 0 ? `+${analysis.trend}g` : `${analysis.trend}g`}
              </p>
              <p className="text-xs text-green-600 mt-1 hidden sm:block">
                较上一餐波动
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 折线图 - 使用固定宽度+滚动容器，避免ResponsiveContainer在某些环境下不渲染的问题 */}
      <div className="w-full overflow-x-auto bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div style={{ minWidth: '600px', height: '350px' }}>
          <LineChart width={600} height={350} data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickMargin={10}
              stroke="#9ca3af"
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#3B82F6" 
              label={{ value: '碳水(g)', angle: -90, position: 'insideLeft', fill: '#3B82F6' }}
              tick={{ fill: '#3B82F6' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#F59E0B" 
              label={{ value: '热量(kcal)', angle: 90, position: 'insideRight', fill: '#F59E0B' }}
              tick={{ fill: '#F59E0B' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            {/* 碳水警戒线 (假设60g为一餐上限) */}
            <ReferenceLine y={60} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label={{ value: '建议上限 (60g)', fill: '#ef4444', fontSize: 12, position: 'insideTopRight' }} />
            
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="净碳水" 
              name="净碳水 (g)"
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="热量" 
              name="热量 (kcal)"
              stroke="#F59E0B" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#fff' }}
            />
          </LineChart>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed">
        <strong className="block text-gray-800 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          智能分析建议:
        </strong>
        {analysis && analysis.avgCarbs > 60 ? (
          <p>您最近的平均碳水摄入量偏高（{analysis.avgCarbs}g/餐）。建议适当减少主食份量，增加绿叶蔬菜和优质蛋白的比例。持续的高碳水摄入可能导致血糖波动加大。</p>
        ) : analysis && analysis.avgCarbs < 30 ? (
          <p>您最近的碳水摄入量较低（{analysis.avgCarbs}g/餐）。如果是生酮饮食请注意监测酮体；如果不是，请确保摄入足够的复杂碳水以维持能量平衡。</p>
        ) : (
          <p>您的饮食控制得当，平均碳水摄入量在建议范围内（{analysis.avgCarbs}g/餐）。请继续保持这种均衡的饮食习惯，并结合适量运动。</p>
        )}
      </div>
    </div>
  )
}
