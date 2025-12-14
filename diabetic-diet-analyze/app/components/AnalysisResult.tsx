'use client'

import { useState } from 'react'
import { 
  Apple, 
  Flame, 
  Scale, 
  Activity, 
  Clock, 
  Heart,
  AlertTriangle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import NutritionPieChart from './NutritionPieChart'

interface NutritionData {
  foods: Array<{
    name: string
    estimated_weight: string
    nutrients?: {
      carbs: number
      protein: number
      fat: number
    }
  }>
  nutrition: {
    total_carbs: string
    fiber: string
    net_carbs: string
    gl_level: string
    calories: string
  }
  risk_level: '低' | '中' | '高'
  color_code: 'green' | 'yellow' | 'red'
  recommendations: string[]
  disclaimer: string
}

interface AnalysisResultProps {
  result: NutritionData
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'foods' | 'advice'>('overview')

  const getRiskColor = (level: string) => {
    switch (level) {
      case '低': return 'bg-green-100 text-green-900 border-green-200'
      case '中': return 'bg-yellow-100 text-yellow-900 border-yellow-200'
      case '高': return 'bg-red-100 text-red-900 border-red-200'
      default: return 'bg-gray-100 text-gray-900 border-gray-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case '低': return <CheckCircle2 className="w-8 h-8 text-green-700" />
      case '中': return <AlertTriangle className="w-8 h-8 text-yellow-700" />
      case '高': return <AlertTriangle className="w-8 h-8 text-red-700" />
      default: return null
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* 1. 营养成分表 (Table) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
           <span className="w-1 h-5 bg-[#769152] rounded-full"></span>
           营养成分
         </h3>
         <div className="overflow-hidden rounded-xl border border-gray-200">
           <table className="w-full text-sm text-center">
             <thead className="bg-[#769152]/10 text-[#769152]">
               <tr>
                 <th className="py-3 font-bold">碳水</th>
                 <th className="py-3 font-bold">蛋白质</th>
                 <th className="py-3 font-bold">脂肪</th>
                 <th className="py-3 font-bold">热量</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               <tr className="bg-white">
                 <td className="py-3 font-bold text-gray-800">{result.nutrition.total_carbs}g</td>
                 <td className="py-3 text-gray-600">--</td>
                 <td className="py-3 text-gray-600">--</td>
                 <td className="py-3 font-bold text-orange-600">{result.nutrition.calories}</td>
               </tr>
             </tbody>
           </table>
           <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
             <div className="p-2 text-center">
               <div className="text-xs text-gray-500">净碳水</div>
               <div className="font-bold text-green-700">{result.nutrition.net_carbs}g</div>
             </div>
             <div className="p-2 text-center">
               <div className="text-xs text-gray-500">升糖负荷 (GL)</div>
               <div className="font-bold text-blue-700">{result.nutrition.gl_level}</div>
             </div>
           </div>
         </div>
      </div>

      {/* 2. 食物详情列表 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
           <span className="w-1 h-5 bg-[#769152] rounded-full"></span>
           食物详情
         </h3>
         <div className="space-y-3">
           {result.foods.map((food, index) => (
             <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#769152]/10 flex items-center justify-center text-[#769152] font-bold text-sm shrink-0">
                   {index + 1}
                 </div>
                 <div>
                   <div className="font-bold text-gray-800">{food.name}</div>
                   <div className="text-xs text-gray-500">约 {food.estimated_weight}</div>
                 </div>
               </div>
               <div className="text-right">
                  <div className="text-xs text-gray-400">碳水</div>
                  <div className="font-bold text-gray-700">{food.nutrients?.carbs || '-'}g</div>
               </div>
             </div>
           ))}
         </div>
      </div>

      {/* 3. 专家建议 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
           <span className="w-1 h-5 bg-[#769152] rounded-full"></span>
           专家建议
         </h3>
         <div className="space-y-3">
           {result.recommendations.map((advice, index) => (
              <div key={index} className="flex gap-3 text-sm text-gray-700 leading-relaxed p-2 hover:bg-green-50 rounded-lg transition-colors">
                 <CheckCircle2 className="w-5 h-5 text-[#769152] shrink-0 mt-0.5" />
                 <span>{advice}</span>
              </div>
           ))}
         </div>
         {/* 风险提示 Banner */}
         <div className={`mt-4 p-3 rounded-xl border ${getRiskColor(result.risk_level)} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
               {getRiskIcon(result.risk_level)}
               <span className="font-bold">综合风险等级: {result.risk_level}</span>
            </div>
            <span className="text-2xl">
               {result.risk_level === '低' && '🟢'}
               {result.risk_level === '中' && '🟡'}
               {result.risk_level === '高' && '🔴'}
            </span>
         </div>
      </div>

      {/* 4. 底部声明 */}
      <div className="text-center text-xs text-gray-400 px-4">
        <p>⚠️ {result.disclaimer}</p>
      </div>
    </div>
  )
}