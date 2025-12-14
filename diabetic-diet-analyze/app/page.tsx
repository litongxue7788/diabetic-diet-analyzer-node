'use client'

import { useState, useEffect } from 'react'
import ImageUploader from './components/ImageUploader'
import ModelSelector from './components/ModelSelector'
import AnalysisResult from './components/AnalysisResult'
import DietHistoryChart from './components/DietHistoryChart'
import NutritionPieChart from './components/NutritionPieChart'
import { Camera, FileText, ChevronRight, Settings, User } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0)
  const [file, setFile] = useState<File | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>('doubao-vision')
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [nickname, setNickname] = useState<string>('')
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [adminMode, setAdminMode] = useState<boolean>(false)
  
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
  const modelShortLabel: Record<string, string> = { 'doubao-vision': '豆包', 'glm-4v': '智谱', 'qwen-vl-plus': '通义' }

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

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dda_settings') || '{}')
      if (saved.nickname) setNickname(saved.nickname)
      if (typeof saved.loggedIn === 'boolean') setLoggedIn(saved.loggedIn)
      const savedKeys = JSON.parse(localStorage.getItem('dda_api_keys') || '{}')
      if (savedKeys && typeof savedKeys === 'object') setApiKeys(prev => ({ ...prev, ...savedKeys }))
      const savedDoubao = localStorage.getItem('dda_doubao_endpoint') || ''
      if (savedDoubao) setDoubaoEndpoint(savedDoubao)
      const savedAdmin = localStorage.getItem('dda_admin') || ''
      if (savedAdmin) setAdminMode(savedAdmin === '1')
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('dda_settings', JSON.stringify({ nickname, loggedIn }))
    } catch {}
  }, [nickname, loggedIn])

  useEffect(() => {
    try {
      localStorage.setItem('dda_api_keys', JSON.stringify(apiKeys))
    } catch {}
  }, [apiKeys])

  useEffect(() => {
    try {
      localStorage.setItem('dda_doubao_endpoint', doubaoEndpoint || '')
    } catch {}
  }, [doubaoEndpoint])

  useEffect(() => {
    try {
      localStorage.setItem('dda_admin', adminMode ? '1' : '0')
    } catch {}
  }, [adminMode])

  return (
    <main className="min-h-screen bg-[#E9F3E2] text-[#2C3E20] pb-24 font-sans">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative rounded-3xl border-4 border-[#6F8D45] overflow-hidden">
        
        {/* Header */}
        <header className="bg-[#769152] text-white p-4 text-center font-bold text-lg sticky top-0 z-30 shadow-md flex justify-between items-center">
          <span>糖尿病膳食分析</span>
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <div className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-full cursor-pointer hover:bg-white/20" onClick={() => setShowSettings(true)}>
                <User className="w-4 h-4" />
                <span>{nickname || '用户'}</span>
              </div>
            ) : (
              <div className="text-xs font-normal opacity-80">v1.2</div>
            )}
            <button
              onClick={() => setShowSettings(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {showSettings && (
          <div className="absolute top-14 right-3 z-40 w-[92%] max-w-sm bg-white border border-[#6F8D45]/40 rounded-2xl shadow-xl">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#2C3E20]">用户设置</div>
                <button onClick={() => setShowSettings(false)} className="text-xs px-2 py-1 rounded bg-[#769152] text-white">关闭</button>
              </div>
              <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                <div className="text-gray-600">当前模型</div>
                <div className="font-bold text-[#2C3E20]">{modelShortLabel[selectedModel] || selectedModel}</div>
              </div>
              {provider === 'doubao' && (
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={doubaoEndpoint}
                    onChange={(e) => setDoubaoEndpoint(e.target.value)}
                    placeholder="Doubao Endpoint ID"
                    className="w-full p-2 border rounded-lg text-xs bg-gray-50"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="昵称"
                  className="w-full p-2 border rounded-lg text-xs bg-gray-50"
                />
                <button
                  onClick={() => setLoggedIn(v => !v)}
                  className="w-full p-2 rounded-lg text-xs font-bold border border-[#769152] text-[#769152] bg-white"
                >
                  {loggedIn ? '退出' : '登录'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">管理员模式</span>
                <button
                  onClick={() => setAdminMode(v => !v)}
                  className={`w-12 h-6 rounded-full ${adminMode ? 'bg-[#769152]' : 'bg-gray-300'} relative`}
                >
                  <span className={`absolute top-0.5 ${adminMode ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full`}></span>
                </button>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-500 mb-2">模型选择</div>
                <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} variant="horizontal" />
              </div>
              {adminMode && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="text-xs text-gray-500">高级设置</div>
                  <input
                    type="password"
                    value={apiKeys[provider]}
                    onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                    placeholder={`${provider.toUpperCase()} API Key`}
                    className="w-full p-2 border rounded-lg text-xs bg-gray-50"
                  />
                  {provider === 'ali' && (
                    <input
                      type="text"
                      value={aliBaseUrl}
                      onChange={(e) => setAliBaseUrl(e.target.value)}
                      placeholder="Ali Base URL"
                      className="w-full p-2 border rounded-lg text-xs bg-gray-50"
                    />
                  )}
                  {provider === 'deepseek' && (
                    <input
                      type="text"
                      value={deepseekBaseUrl}
                      onChange={(e) => setDeepseekBaseUrl(e.target.value)}
                      placeholder="Deepseek Base URL"
                      className="w-full p-2 border rounded-lg text-xs bg-gray-50"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Dashboard */}
        <div className={activeTab === 0 ? 'block' : 'hidden'}>
           {/* Top: Upload only */}
           <div className="p-3 bg-white border-b-2 border-[#6F8D45]/60">
             <div className="mt-3 relative h-40 sm:h-44 overflow-hidden bg-white rounded-2xl">
               <ImageUploader onImageSelect={(f) => { setFile(f); setResult(null); }}>
                  {file && !result && !loading && (
                     <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                          className="bg-[#769152] text-white px-6 py-2 rounded-full shadow-lg font-bold text-base animate-pulse hover:animate-none flex items-center gap-2 border border-[#6F8D45]"
                        >
                          <span>✨ 点击分析</span>
                        </button>
                     </div>
                  )}
                  {loading && (
                     <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center">
                       <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#769152]"></div>
                       <span className="mt-2 text-xs font-bold text-[#769152]">正在分析...</span>
                     </div>
                  )}
               </ImageUploader>
             </div>
             <div className="mt-2 flex items-center justify-between">
               <span className="text-xs text-[#769152] bg-green-50 rounded-full px-2 py-1 border border-[#6F8D45]/30">
                 当前模型：{modelShortLabel[selectedModel] || selectedModel}
               </span>
               <button
                 onClick={() => file ? handleAnalyze() : setShowSettings(true)}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                   file ? 'bg-[#769152] text-white border-[#6F8D45]' : 'bg-white text-[#769152] border-[#6F8D45]/40'
                 }`}
               >
                 {file ? '开始分析' : '选择模型'}
               </button>
             </div>
           </div>

           {/* Middle: 2-Column Charts Grid */}
           <div className="p-4 grid grid-cols-2 gap-4">
              {/* Left: Pie Chart */}
              <div className="bg-white p-3 rounded-2xl border-2 border-[#6F8D45]/50 shadow-sm flex flex-col h-56">
                 <h4 className="text-sm font-bold text-gray-700 mb-2 text-center">营养分布</h4>
                 <div className="flex-1 relative">
                   {result && result.foods ? (
                     <div className="absolute inset-0 scale-90 origin-center">
                       <NutritionPieChart foods={result.foods} simple />
                     </div>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-300">
                       <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
                     </div>
                   )}
                 </div>
              </div>

              {/* Right: Line Chart */}
               <div className="bg-white p-3 rounded-2xl border-2 border-[#6F8D45]/50 shadow-sm flex flex-col h-56">
                 <h4 className="text-sm font-bold text-gray-700 mb-2 text-center">血糖/饮食趋势</h4>
                 <div className="flex-1 overflow-hidden">
                   <DietHistoryChart />
                 </div>
               </div>
           </div>

           {/* Bottom: Analysis Advice */}
           <div className="px-4 pb-20">
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#6F8D45]/50">
                 <h3 className="text-[#769152] font-bold text-lg mb-3 flex items-center gap-2">
                   <span className="w-1 h-5 bg-[#769152] rounded-full"></span>
                   分析建议
                 </h3>
                 {result ? (
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              result.risk_level === '低' ? 'bg-green-100 text-green-700' :
                              result.risk_level === '中' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                           }`}>
                              {result.risk_level}风险
                           </span>
                           <span className="text-xs text-gray-400">基于本次餐食</span>
                        </div>
                        {result.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                           <div key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                              <span className="text-[#769152] mt-0.5">•</span>
                              <span>{rec}</span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center text-gray-400 py-4 text-sm">
                        <p>暂无分析数据</p>
                        <p className="text-xs mt-1 opacity-60">请先上传照片并分析</p>
                     </div>
                  )}
               </div>
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

        {/* Bottom Navigation: Capsule Buttons (integrated) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[360px] h-16 bg-[#769152]/90 rounded-full border border-[#6F8D45] p-2 flex items-center backdrop-blur-sm">
          <button
            onClick={() => setActiveTab(0)}
            className={`flex-1 rounded-full px-5 py-2.5 font-bold text-sm flex items-center justify-center transition-all ${
              activeTab === 0
                ? 'bg-white text-[#769152] shadow ring-1 ring-[#6F8D45]/50'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <span>分析</span>
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 rounded-full px-5 py-2.5 font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 1
                ? 'bg-white text-[#769152] shadow ring-1 ring-[#6F8D45]/50'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>详细报告</span>
          </button>
        </div>

       </div>
     </main>
   )
  }
