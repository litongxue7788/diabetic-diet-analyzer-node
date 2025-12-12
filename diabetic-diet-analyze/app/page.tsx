import ImageUploader from './components/ImageUploader'
import ModelSelector from './components/ModelSelector'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          上传食物图片进行分析
        </h2>
        <ImageUploader />
        
        <div className="mt-6">
          <ModelSelector />
        </div>
        
        <button
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          onClick={() => alert('开始分析')}
        >
          开始AI分析
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          分析结果
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p>请先上传图片并开始分析</p>
        </div>
      </div>
    </div>
  )
}
