'use client'

import { useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'

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
      <div className="flex justify-center items-center w-full h-full">
        <PieChart width={120} height={120}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={50}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: number) => [`${value}g`, '']}
             contentStyle={{ borderRadius: '4px', fontSize: '10px', padding: '4px' }}
          />
        </PieChart>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-xl p-4 border border-gray-100 flex flex-col items-center">
      <h4 className="text-lg font-bold text-gray-800 mb-2">三大营养素占比 (克)</h4>
      <div className="flex justify-center">
        <PieChart width={300} height={250}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}g`, '含量']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </div>
    </div>
  )
}
