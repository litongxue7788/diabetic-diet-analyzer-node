'use client'

import { useState } from 'react'
import ImageUploader from '@/app/components/ImageUploader'
import ModelSelector from '@/app/components/ModelSelector'
import AnalysisResult from '@/app/components/AnalysisResult'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import { analyzeImage } from '@/lib/ai/analyzer'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedModel, setSelectedModel] = useState('gemini-pro-vision')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setError(null)
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('请先选择一张图片')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('model', selectedModel)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('分析失败，请重试')
      }

      const result = await response.json()
      setAnalysisResult(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 标题 */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          糖尿病膳食分析助手
        </h1>
        <p className="text-lg text-gray-600">
          上传食物图片，获取专业的糖尿病营养分析报告
        </p>
        <div className="mt-6 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">AI智能识别</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700">专业营养分析</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-700">个性化建议</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：上传和分析区域 */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              上传食物图片
            </h2>
            
            <ImageUploader onImageSelect={handleImageSelect} />
            
            <div className="mt-6">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelSelect={handleModelSelect}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isLoading}
              className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner className="mr-2" />
                  分析中...
                </span>
              ) : (
                '开始AI分析'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* 使用说明 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              💡 使用说明
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                上传清晰的食物图片，确保光线充足
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                支持JPG、PNG格式，最大5MB
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                AI将分析食物成分和营养数据
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                获取针对糖尿病患者的个性化建议
              </li>
            </ul>
          </div>
        </div>

        {/* 右侧：分析结果区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            分析结果
          </h2>
          
          {analysisResult ? (
            <AnalysisResult result={analysisResult} />
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                等待分析结果
              </h3>
              <p className="text-gray-500">
                上传食物图片后，点击"开始AI分析"获取专业营养报告
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 免责声明 */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>
          ⚠️ 免责声明：本工具仅为膳食管理参考，不能替代专业医疗诊断和医嘱。
        </p>
      </div>
    </div>
  )
}
