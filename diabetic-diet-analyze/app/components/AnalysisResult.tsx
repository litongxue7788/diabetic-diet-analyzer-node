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
  CheckCircle2
} from 'lucide-react'

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
      case '低': return 'text-green-600 bg-green-50'
      case '中': return 'text-yellow-600 bg-yellow-50'
      case '高': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case '低': return <CheckCircle2 className="w-5 h-5" />
      case '中': return <AlertTriangle className="w-5 h-5" />
      case '高': return <AlertTriangle className="w-5 h-5" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 风险等级 */}
      <div className={`p-6 rounded-2xl ${getRiskColor(result.risk_level)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getRiskIcon(result.risk_level)}
            <h3 className="text-xl font-semibold">风险等级: {result.risk_level}</h3>
          </div>
          <div className="text-3xl">
            {result.risk_level === '低' && '🟢'}
            {result.risk_level === '中' && '🟡'}
            {result.risk_level === '高' && '🔴'}
          </div>
        </div>
        <p className="text-sm opacity-80">
          {result.risk_level === '低' && '这顿饭对血糖影响较小，可以安心享用。'}
          {result.risk_level === '中' && '需要注意碳水摄入量，建议适量调整。'}
          {result.risk_level === '高' && '碳水含量较高，建议调整食物搭配。'}
        </p>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {['overview', 'foods', 'advice'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && '营养概览'}
              {tab === 'foods' && '食物详情'}
              {tab === 'advice' && '建议指南'}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Apple className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-700">
                  {result.nutrition.net_carbs}
                </span>
              </div>
              <h4 className="font-medium text-gray-700">净碳水</h4>
              <p className="text-sm text-gray-500 mt-1">总碳水 - 膳食纤维</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-700">
                  {result.nutrition.gl_level}
                </span>
              </div>
              <h4 className="font-medium text-gray-700">升糖负荷</h4>
              <p className="text-sm text-gray-500 mt-1">预估血糖影响</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Scale className="w-6 h-6 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-700">
                  {result.nutrition.fiber}
                </span>
              </div>
              <h4 className="font-medium text-gray-700">膳食纤维</h4>
              <p className="text-sm text-gray-500 mt-1">帮助控制血糖</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-6 h-6 text-orange-600" />
                <span className="text-2xl font-bold text-orange-700">
                  {result.nutrition.calories}
                </span>
              </div>
              <h4 className="font-medium text-gray-700">总热量</h4>
              <p className="text-sm text-gray-500 mt-1">千卡</p>
            </div>
          </div>
        )}

        {activeTab === 'foods' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">识别到的食物</h4>
            <div className="space-y-3">
              {result.foods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Apple className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800">{food.name}</h5>
                      <p className="text-sm text-gray-500">估算重量: {food.estimated_weight}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">碳水: {food.nutrients?.carbs || '--'}g</p>
                    <p className="text-sm text-gray-500">蛋白质: {food.nutrients?.protein || '--'}g</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'advice' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                具体建议
              </h4>
              <div className="space-y-3">
                {result.recommendations.map((advice, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{advice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <h5 className="font-medium text-gray-800">进餐时间建议</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    建议在餐后30分钟进行15-20分钟的散步，有助于降低餐后血糖峰值。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 免责声明 */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 text-center">
            {result.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}
