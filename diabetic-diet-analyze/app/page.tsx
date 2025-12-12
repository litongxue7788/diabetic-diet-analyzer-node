import ImageUploader from '../components/ImageUploader';
import ModelSelector from '../components/ModelSelector';
import AnalysisResult from '../components/AnalysisResult';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            糖尿病膳食分析助手
          </h1>
          <p className="text-gray-600 mt-2">
            上传食物图片，获取专业的营养分析报告
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传和分析 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">
              上传食物图片
            </h2>
            <ImageUploader />
            <div className="mt-6">
              <ModelSelector />
            </div>
            <button
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              onClick={() => alert('开始分析')}
            >
              开始分析
            </button>
          </div>

          {/* 右侧：结果展示 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">
              分析结果
            </h2>
            <AnalysisResult />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>免责声明：本工具为膳食管理参考，不能替代专业医疗诊断和医嘱。</p>
        </footer>
      </div>
    </main>
  );
}
