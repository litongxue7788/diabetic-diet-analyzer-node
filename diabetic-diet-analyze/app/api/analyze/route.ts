import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { analyzeImage } from '@/lib/ai/analyzer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const model = formData.get('model') as string || 'gemini-pro-vision'

    if (!image) {
      return NextResponse.json(
        { error: '请提供图片文件' },
        { status: 400 }
      )
    }

    // 验证图片类型和大小
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { error: '仅支持 JPG、PNG、WEBP 格式的图片' },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: '图片大小不能超过 5MB' },
        { status: 400 }
      )
    }

    // 调用AI分析
    const result = await analyzeImage(image, model)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('分析错误:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '分析失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
