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
  {
    id: 'qwen-vl-plus',
    name: 'Qwen-VL-Plus',
    description: '阿里通义千问视觉模型，支持图片多模态理解',
    provider: 'Ali',
    maxImageSize: '5MB',
    status: 'available' as const,
  },
  {
    id: 'deepseek-vl',
    name: 'DeepSeek-V3 (Chat)',
    description: 'DeepSeek官方API (纯文本) / 自定义端点 (支持VL)',
    provider: 'DeepSeek',
    maxImageSize: '5MB',
    status: 'available' as const,
  },
  {
    id: 'yi-vision',
    name: 'Yi-Vision (零一万物)',
    description: '零一万物高表现力视觉模型，中文理解能力强',
    provider: 'Yi',
    maxImageSize: '5MB',
    status: 'available' as const,
  },
  {
    id: 'glm-4v',
    name: 'GLM-4V (智谱AI)',
    description: '智谱AI最新视觉模型，国产模型第一梯队，擅长中文识别',
    provider: 'Zhipu',
    maxImageSize: '5MB',
    status: 'available' as const,
  },
  {
    id: 'doubao-vision',
    name: 'Doubao Vision (豆包/火山引擎)',
    description: '字节跳动豆包大模型，视觉理解能力出色',
    provider: 'Doubao',
    maxImageSize: '5MB',
    status: 'available' as const,
  }
]

export async function GET() {
  return NextResponse.json({
    success: true,
    models,
    defaultModel: 'doubao-vision',
  })
}
