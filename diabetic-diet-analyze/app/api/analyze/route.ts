import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 禁用bodyParser，使用原生的request方法
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // 检查API密钥
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY 未配置' },
        { status: 500 }
      );
    }

    // 获取表单数据
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const modelName = formData.get('model') as string || 'gemini-pro-vision';

    // 验证图片
    if (!image) {
      return NextResponse.json(
        { error: '请上传图片' },
        { status: 400 }
      );
    }

    // 将图片转换为base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 调用Gemini API
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `你是一位专业的糖尿病营养师。请分析这张食物图片并提供以下信息：
    1. 识别所有食物并估算重量
    2. 计算：总碳水化合物、膳食纤维、净碳水化合物
    3. 评估升糖负荷(GI/GL)等级（低/中/高）
    4. 提供具体建议
    请以JSON格式返回。`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // 尝试解析JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // 如果不是JSON，返回原始文本
      data = { analysis: text };
    }

    return NextResponse.json({
      success: true,
      data,
      model: modelName,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('分析错误:', error);
    return NextResponse.json(
      { 
        error: '分析失败',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '请使用POST方法上传图片',
    endpoint: '/api/analyze',
    method: 'POST',
    parameters: {
      image: '图片文件',
      model: '模型名称（可选）'
    }
  });
}
