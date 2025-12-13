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
    <div className="space-y-8">
      {/* 风险等级 Banner - 高对比度大字 */}
      <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.risk_level)} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getRiskIcon(result.risk_level)}
            <div>
              <h3 className="text-2xl font-bold">风险等级: {result.risk_level}</h3>
              <p className="text-lg mt-1 font-medium opacity-90">
                {result.risk_level === '低' && '✅ 血糖影响小，放心食用'}
                {result.risk_level === '中' && '⚠️ 注意份量，适量食用'}
                {result.risk_level === '高' && '🚫 碳水较高，建议少吃'}
              </p>
            </div>
          </div>
          <div className="text-5xl">
            {result.risk_level === '低' && '🟢'}
            {result.risk_level === '中' && '🟡'}
            {result.risk_level === '高' && '🔴'}
          </div>
        </div>
      </div>

      {/* 标签页导航 - 大按钮 */}
      <div className="bg-gray-100 p-1.5 rounded-xl flex gap-2">
        {['overview', 'foods', 'advice'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all shadow-sm ${
              activeTab === tab
                ? 'bg-white text-green-700 shadow-md ring-1 ring-black/5'
                : 'bg-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' && '📊 营养概览'}
            {tab === 'foods' && '🥗 食物详情'}
            {tab === 'advice' && '💡 专家建议'}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* 饼图 */}
               <NutritionPieChart foods={result.foods} />
               
               {/* 核心指标卡片 */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100 flex flex-col items-center text-center shadow-sm justify-center">
                   <div className="flex items-center gap-2 mb-1">
                      <Apple className="w-6 h-6 text-green-600" />
                      <h4 className="text-lg font-bold text-green-800">净碳水</h4>
                   </div>
                   <span className="text-3xl font-extrabold text-green-700 my-1">
                     {result.nutrition.net_carbs}
                   </span>
                   <p className="text-sm text-green-700 font-medium">克 (g)</p>
                 </div>

                 <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 flex flex-col items-center text-center shadow-sm justify-center">
                   <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-6 h-6 text-blue-600" />
                      <h4 className="text-lg font-bold text-blue-800">升糖负荷</h4>
                   </div>
                   <span className="text-3xl font-extrabold text-blue-700 my-1">
                     {result.nutrition.gl_level}
                   </span>
                   <p className="text-sm text-blue-700 font-medium">GL 值</p>
                 </div>

                 <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100 flex flex-col items-center text-center shadow-sm justify-center">
                   <div className="flex items-center gap-2 mb-1">
                      <Scale className="w-6 h-6 text-yellow-600" />
                      <h4 className="text-lg font-bold text-yellow-800">膳食纤维</h4>
                   </div>
                   <span className="text-3xl font-bold text-yellow-700 my-1">
                     {result.nutrition.fiber}
                   </span>
                   <p className="text-sm text-yellow-700 font-medium">克 (g)</p>
                 </div>

                 <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 flex flex-col items-center text-center shadow-sm justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-6 h-6 text-orange-600" />
                      <h4 className="text-lg font-bold text-orange-800">总热量</h4>
                    </div>
                   <span className="text-3xl font-bold text-orange-700 my-1">
                     {result.nutrition.calories}
                   </span>
                   <p className="text-sm text-orange-700 font-medium">千卡</p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'foods' && (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-800 mb-4 px-2">识别到的食物清单:</h4>
            {result.foods.map((food, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-green-200 transition-colors"
              >
                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-green-700">{index + 1}</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900">{food.name}</h5>
                    <p className="text-lg text-gray-600 mt-1">
                      约 <span className="font-bold text-gray-900">{food.estimated_weight}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 pl-16 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <p className="text-base text-gray-500">碳水</p>
                    <p className="text-xl font-bold text-gray-900">{food.nutrients?.carbs || '--'}g</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-base text-gray-500">蛋白质</p>
                    <p className="text-xl font-bold text-gray-900">{food.nutrients?.protein || '--'}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'advice' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-2">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
                营养师建议
              </h4>
              <div className="space-y-4">
                {result.recommendations.map((advice, index) => (
                  <div
                    key={index}
                    className="p-5 bg-green-50 rounded-2xl border border-green-200 flex gap-4"
                  >
                    <ChevronRight className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-lg text-gray-800 leading-relaxed font-medium">
                      {advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                  <h5 className="text-xl font-bold text-gray-900">运动建议</h5>
                  <p className="text-lg text-gray-700 mt-2 leading-relaxed">
                    建议在餐后 <span className="font-bold text-blue-700">30分钟</span> 后，
                    进行 <span className="font-bold text-blue-700">15-20分钟</span> 的轻松散步。
                    这能显著帮助肌肉吸收血糖，平稳餐后峰值。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 免责声明 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-base text-gray-500 text-center leading-relaxed">
            📢 {result.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}