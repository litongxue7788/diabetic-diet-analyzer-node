'use client'

import { useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface NutritionPieChartProps {
  foods: Array<{
    nutrients?: {
      carbs: number
      protein: number
      fat: number
    }
  }>
  simple?: boolean
}

export default function NutritionPieChart({ foods, simple }: NutritionPieChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const shade = (hex: string, percent: number) => {
    const f = parseInt(hex.slice(1), 16)
    const t = percent < 0 ? 0 : 255
    const p = Math.abs(percent)
    const R = f >> 16
    const G = (f >> 8) & 0x00ff
    const B = f & 0x0000ff
    const nr = Math.round((t - R) * p) + R
    const ng = Math.round((t - G) * p) + G
    const nb = Math.round((t - B) * p) + B
    return `#${(0x1000000 + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`
  }

  const data = useMemo(() => {
    let carbs = 0
    let protein = 0
    let fat = 0

    foods.forEach(food => {
      if (food.nutrients) {
        carbs += food.nutrients.carbs || 0
        protein += food.nutrients.protein || 0
        fat += food.nutrients.fat || 0
      }
    })

    // 如果数据都是0，返回空
    if (carbs === 0 && protein === 0 && fat === 0) return []

    return [
      { name: '碳水化合物', value: Math.round(carbs), color: '#3B82F6' }, // Blue
      { name: '蛋白质', value: Math.round(protein), color: '#10B981' }, // Green
      { name: '脂肪', value: Math.round(fat), color: '#F59E0B' }, // Yellow
    ]
  }, [foods])

  if (!isMounted || data.length === 0) return null

  if (simple) {
    return (
      <div className="flex flex-col items-center w-full h-full">
        <PieChart width={120} height={90}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={26}
            outerRadius={42}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke={shade(entry.color, -0.2)} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: number) => [`${value}g`, '']}
             contentStyle={{ borderRadius: '6px', fontSize: '10px', padding: '6px' }}
          />
        </PieChart>
        <div className="mt-1 grid grid-cols-3 gap-2 text-[10px]">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }}></span>
              <span className="text-gray-500">{d.name.replace('碳水化合物','碳水')}</span>
              <span className="font-bold text-gray-800">{d.value}g</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-xl p-4 border border-gray-100 flex flex-col items-center">
      <h4 className="text-lg font-bold text-gray-800 mb-2">三大营养素占比 (克)</h4>
      <div className="flex justify-center">
        <ResponsiveContainer width={300} height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={84}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={shade(entry.color, -0.2)} strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}g`, '含量']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 w-full flex justify-around text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: d.color }}></span>
            <span className="text-gray-600">{d.name}</span>
            <span className="font-bold text-gray-900">{d.value}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}
