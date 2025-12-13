'use client'

import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import ModelSelector from './components/ModelSelector'
import AnalysisResult from './components/AnalysisResult'
import DietHistoryChart from './components/DietHistoryChart'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro-vision')
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState(Date.now())
  const provider = selectedModel.startsWith('gemini') ? 'google' 
    : selectedModel.startsWith('qwen') ? 'ali' 
    : selectedModel.startsWith('deepseek') ? 'deepseek' 
    : selectedModel.startsWith('yi') ? 'yi'
    : selectedModel.startsWith('glm') ? 'zhipu'
    : selectedModel.startsWith('doubao') ? 'doubao'
    : 'google'
  const [apiKeys, setApiKeys] = useState<{ google: string; ali: string; deepseek: string; yi: string; zhipu: string; doubao: string }>({ google: '', ali: '', deepseek: '', yi: '', zhipu: '', doubao: '' })
  const [aliBaseUrl, setAliBaseUrl] = useState<string>('https://dashscope.aliyuncs.com/compatible-mode/v1')
  const [doubaoEndpoint, setDoubaoEndpoint] = useState<string>('')
  const [deepseekBaseUrl, setDeepseekBaseUrl] = useState<string>('https://api.deepseek.com')

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
      if (apiKeys[provider]) {
        formData.append('apiKey', apiKeys[provider])
      }
      if (provider === 'ali' && aliBaseUrl) {
        formData.append('baseUrl', aliBaseUrl)
      }
      if (provider === 'deepseek' && deepseekBaseUrl) {
        formData.append('baseUrl', deepseekBaseUrl)
      }

      if (provider === 'doubao' && doubaoEndpoint) {
        formData.append('endpoint', doubaoEndpoint)
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || '分析失败')
      }
      setResult(json.data)
      
      // 保存到历史记录
      if (json.data && json.data.nutrition) {
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
          setLastSaved(Date.now())
        } catch (e) {
          console.error('Failed to save history', e)
        }
      }
    } catch (e: any) {
      setError(e.message || '分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 pb-24 sm:px-6 sm:pb-8">
      {/* 顶部标题栏，移动端更紧凑 */}
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          📸 拍摄食物
        </h2>
        <div className="bg-gray-50 rounded-xl p-2">
          <ImageUploader onImageSelect={setFile} />
        </div>
        
        <div className="mt-6 sm:mt-8">
          <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
          {provider === 'doubao' && (
            <div className="space-y-3 mt-6">
              <label className="block text-lg font-medium text-gray-800">Doubao Endpoint ID (接入点ID)</label>
              <input
                type="text"
                value={doubaoEndpoint}
                onChange={(e) => setDoubaoEndpoint(e.target.value)}
                placeholder="例如: ep-202405... (从火山引擎控制台获取)"
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all placeholder:text-gray-400"
              />
            </div>
          )}
        </div>

        {/* API Key 配置区域 - 可折叠或简化，这里保持展开但优化移动端显示 */}
        <div className="mt-8 p-5 sm:p-6 bg-gray-50 rounded-2xl space-y-4 border border-gray-100">
          <label className="block text-lg font-medium text-gray-800 flex items-center gap-2">
            🔑 
            {provider === 'google' && 'Gemini API Key'}
            {provider === 'ali' && 'DashScope API Key'}
            {provider === 'deepseek' && 'DeepSeek API Key'}
            {provider === 'yi' && 'Yi (零一万物) API Key'}
            {provider === 'zhipu' && 'Zhipu (智谱) API Key'}
            {provider === 'doubao' && 'Volcengine (火山引擎) API Key'}
          </label>
          <input
            type="password"
            value={apiKeys[provider]}
            onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
            placeholder={provider === 'doubao' ? "输入API Key" : "粘贴 API Key"}
            className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all placeholder:text-gray-400"
          />

          {provider === 'ali' && (
            <div className="space-y-3 pt-2">
              <label className="block text-lg font-medium text-gray-800">DashScope Base URL</label>
              <input
                type="text"
                value={aliBaseUrl}
                onChange={(e) => setAliBaseUrl(e.target.value)}
                placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
              />
            </div>
          )}

          {provider === 'deepseek' && (
            <div className="space-y-3 pt-2">
              <label className="block text-lg font-medium text-gray-800">DeepSeek Base URL</label>
              <input
                type="text"
                value={deepseekBaseUrl}
                onChange={(e) => setDeepseekBaseUrl(e.target.value)}
                placeholder="https://api.deepseek.com (默认)"
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
              />
            </div>
          )}
        </div>
        
        {/* 移动端吸底按钮占位，大屏直接显示 */}
        <button
          className="mt-8 w-full bg-green-600 text-white py-5 px-6 rounded-2xl text-xl font-bold hover:bg-green-700 active:scale-[0.99] transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hidden sm:block"
          onClick={handleAnalyze}
          disabled={!file || loading}
        >
          {loading ? '⏳ 正在分析中...' : '🚀 开始智能分析'}
        </button>
      </div>
      
      {/* 移动端底部固定悬浮按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 sm:hidden z-50">
        <button
          className="w-full bg-green-600 text-white py-4 px-6 rounded-xl text-xl font-bold hover:bg-green-700 active:scale-[0.95] transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAnalyze}
          disabled={!file || loading}
        >
          {loading ? '⏳ 分析中...' : '🚀 开始智能分析'}
        </button>
      </div>
      
      <div ref={(el) => { if (result && el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
        {error && (
          <div className="p-6 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-lg font-medium flex items-center gap-3">
            ⚠️ {error}
          </div>
        )}
        
        {!error && !loading && result && (
           <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-8 border border-gray-100">
             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-3">
               📋 分析报告
             </h2>
             {result.foods && result.nutrition ? (
               <AnalysisResult result={result} />
             ) : (
               <div className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-xl">
                 {typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result, null, 2)}
               </div>
             )}
           </div>
        )}
      </div>

      <div className="mt-8 sm:mt-12">
        <DietHistoryChart key={lastSaved} />
      </div>
    </div>
  )
}