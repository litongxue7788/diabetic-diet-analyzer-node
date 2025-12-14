'use client'

import { useState, useEffect } from 'react'
import ImageUploader from './components/ImageUploader'
import ModelSelector from './components/ModelSelector'
import AnalysisResult from './components/AnalysisResult'
import DietHistoryChart from './components/DietHistoryChart'
import NutritionPieChart from './components/NutritionPieChart'
import { Camera, FileText, ChevronRight } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0)
  const [file, setFile] = useState<File | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro-vision')
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // API Keys state
  const provider = selectedModel.startsWith('gemini') ? 'google' 
    : selectedModel.startsWith('qwen') ? 'ali' 
    : selectedModel.startsWith('deepseek') ? 'deepseek' 
    : selectedModel.startsWith('yi') ? 'yi'
    : selectedModel.startsWith('glm') ? 'zhipu'
    : selectedModel.startsWith('doubao') ? 'doubao'
    : 'google'
  
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({ google: '', ali: '', deepseek: '', yi: '', zhipu: '', doubao: '' })
  const [aliBaseUrl, setAliBaseUrl] = useState<string>('https://dashscope.aliyuncs.com/compatible-mode/v1')
  const [deepseekBaseUrl, setDeepseekBaseUrl] = useState<string>('https://api.deepseek.com')
  const [doubaoEndpoint, setDoubaoEndpoint] = useState<string>('')

  // Handle Analysis
  const handleAnalyze = async () => {
    if (!file) {
      alert('请先选择图片')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('model', selectedModel)
      if (apiKeys[provider]) formData.append('apiKey', apiKeys[provider])
      if (provider === 'ali' && aliBaseUrl) formData.append('baseUrl', aliBaseUrl)
      if (provider === 'deepseek' && deepseekBaseUrl) formData.append('baseUrl', deepseekBaseUrl)
      if (provider === 'doubao' && doubaoEndpoint) formData.append('endpoint', doubaoEndpoint)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const json = await res.json()
      
      if (!res.ok || !json.success) throw new Error(json.error || '分析失败')
      
      setResult(json.data)
      
      // Auto save history
      if (json.data?.nutrition) {
        try {
          const historyItem = {
            timestamp: Date.now(),
            net_carbs: parseFloat(String(json.data.nutrition.net_carbs).replace(/[^0-9.]/g, '')) || 0,
            calories: parseFloat(String(json.data.nutrition.calories).replace(/[^0-9.]/g, '')) || 0,
            risk_level: json.data.risk_level
          }
          const history = JSON.parse(localStorage.getItem('diet_history') || '[]')
          history.push(historyItem)
          localStorage.setItem('diet_history', JSON.stringify(history))
          // Trigger chart update if possible, or just re-render
          window.dispatchEvent(new Event('storage')) 
        } catch (e) { console.error(e) }
      }
    } catch (e: any) {
      setError(e.message || '分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // Trigger analysis automatically when file is selected? 
  // Maybe not, better to let user confirm. 
  // But for "Wechat style", maybe a "Analyze" button overlay?
  useEffect(() => {
    if (file && !result && !loading) {
       // Optional: Auto analyze? No, let's keep manual for now to allow model selection.
    }
  }, [file])

  return (
    <main className="min-h-screen bg-[#FAFCF8] text-[#2C3E20] pb-24 font-sans">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
        
        {/* Header */}
        <header className="bg-[#769152] text-white p-4 text-center font-bold text-lg sticky top-0 z-30 shadow-md flex justify-between items-center">
          <span>糖尿病膳食分析</span>
          <div className="text-xs font-normal opacity-80">v1.2</div>
        </header>

        {/* Tab 1: Dashboard */}
        <div className={activeTab === 0 ? 'block' : 'hidden'}>
           {/* 1. Large Photo Area */}
           <div className="relative w-full bg-gray-100">
              <ImageUploader onImageSelect={(f) => { setFile(f); setResult(null); }}>
                 {/* Overlay Pie Chart if result exists */}
                 {result && result.foods && (
                    <div className="absolute bottom-2 right-2 w-28 h-28 bg-white/90 rounded-full shadow-lg backdrop-blur-sm z-20 animate-in fade-in zoom-in duration-300">
                       <NutritionPieChart foods={result.foods} simple />
                    </div>
                 )}
                 {/* Overlay Analyze Button if file selected but no result */}
                 {file && !result && !loading && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                         className="bg-[#769152] text-white px-8 py-3 rounded-full shadow-lg font-bold text-lg animate-pulse hover:animate-none"
                       >
                         ✨ 开始分析
                       </button>
                    </div>
                 )}
                 {loading && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20 backdrop-blur-sm">
                       <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#769152]"></div>
                          <span className="font-bold text-[#769152]">正在分析...</span>
                       </div>
                    </div>
                 )}
              </ImageUploader>
           </div>

           {/* Settings / Config (Collapsed by default or small) */}
           {!result && !loading && (
             <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <details className="text-sm text-gray-500">
                  <summary className="cursor-pointer list-none flex items-center gap-2">
                    <span>⚙️ 模型设置 (默认 Gemini)</span>
                    <ChevronRight className="w-4 h-4" />
                  </summary>
                  <div className="mt-2 space-y-3 pb-2">
                    <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
                    <input
                      type="password"
                      value={apiKeys[provider]}
                      onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                      placeholder={`${provider.toUpperCase()} API Key (可选)`}
                      className="w-full p-2 border rounded-lg text-xs"
                    />
                  </div>
                </details>
             </div>
           )}

           {/* 2. Line Chart Area */}
           <div className="mt-6 px-4">
              <div className="flex items-center justify-between mb-3">
                 <h3 className="text-[#769152] font-bold text-lg flex items-center gap-2">
                   <span className="w-1 h-6 bg-[#769152] rounded-full"></span>
                   血糖/饮食趋势
                 </h3>
              </div>
              <div className="bg-white p-2 rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                 <DietHistoryChart />
              </div>
           </div>

           {/* 3. Analysis Advice Area */}
           <div className="mt-6 px-4 pb-8">
              <div className="flex items-center justify-between mb-3">
                 <h3 className="text-[#769152] font-bold text-lg flex items-center gap-2">
                   <span className="w-1 h-6 bg-[#769152] rounded-full"></span>
                   智能分析建议
                 </h3>
              </div>
              
              {result ? (
                 <div className={`p-5 rounded-2xl border-l-4 shadow-sm bg-[#F0F5E9] border-[#769152]`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="font-bold text-lg text-[#2C3E20]">本餐风险评估</span>
                       <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          result.risk_level === '低' ? 'bg-green-200 text-green-800' :
                          result.risk_level === '中' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                       }`}>
                          {result.risk_level}风险
                       </span>
                    </div>
                    <p className="text-[#2C3E20]/80 leading-relaxed text-sm">
                       {result.recommendations?.[0] || result.disclaimer || "建议控制主食摄入，增加蔬菜比例。"}
                    </p>
                    <button 
                      onClick={() => setActiveTab(1)}
                      className="mt-4 text-[#769152] text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                      查看详细报告 <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
              ) : (
                 <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center text-gray-400">
                    <p>拍摄食物后，AI将在此生成个性化建议</p>
                 </div>
              )}
           </div>
        </div>

        {/* Tab 2: Details Report */}
        <div className={activeTab === 1 ? 'block' : 'hidden'}>
           <div className="p-4 min-h-[80vh]">
              {result ? (
                 <AnalysisResult result={result} />
              ) : (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p>暂无详细报告，请先拍摄食物</p>
                    <button 
                      onClick={() => setActiveTab(0)}
                      className="mt-4 px-6 py-2 bg-[#769152] text-white rounded-full text-sm"
                    >
                      去拍摄
                    </button>
                 </div>
              )}
           </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-green-100 flex justify-around py-2 z-50 max-w-md mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <button 
             onClick={() => setActiveTab(0)} 
             className={`flex flex-col items-center p-2 transition-colors ${activeTab === 0 ? 'text-[#769152]' : 'text-gray-400'}`}
           >
             <Camera className={`w-6 h-6 mb-1 ${activeTab === 0 ? 'fill-current' : ''}`} />
             <span className="text-xs font-medium">拍摄/分析</span>
           </button>
           <button 
             onClick={() => setActiveTab(1)} 
             className={`flex flex-col items-center p-2 transition-colors ${activeTab === 1 ? 'text-[#769152]' : 'text-gray-400'}`}
           >
             <FileText className={`w-6 h-6 mb-1 ${activeTab === 1 ? 'fill-current' : ''}`} />
             <span className="text-xs font-medium">详细报告</span>
           </button>
        </div>

      </div>
    </main>
  )
}
