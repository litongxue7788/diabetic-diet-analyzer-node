import { NextResponse } from 'next/server'

const models = [
  {
    id: 'gemini-pro-vision',
    name: 'Google Gemini Pro Vision',
    description: 'Google最新视觉模型，适合食物识别和营养分析',
    provider: 'Google',
    maxImageSize: '5MB',
    status: 'available' as const,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: '快速响应模型，平衡速度和准确性',
    provider: 'Google',
    maxImageSize: '5MB',
    status: 'available' as const,
  },
  // 可以添加更多模型
]

export async function GET() {
  return NextResponse.json({
    success: true,
    models,
    defaultModel: 'gemini-pro-vision',
  })
}
