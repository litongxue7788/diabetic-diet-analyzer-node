import { GoogleGenerativeAI } from '@google/generative-ai'

const systemPrompt = `你是一位专业的糖尿病营养师，拥有10年临床经验。你的任务是分析食物图片并为糖尿病患者提供具体、可操作的建议。

请分析用户上传的食物图片，并以JSON格式返回以下信息：

1. 食物识别：列出所有可见的食物，并估算每样食物的重量（克）
2. 营养分析：
   - 总碳水化合物（克）
   - 膳食纤维（克）
   - 净碳水化合物（克）
   - 预估升糖负荷（GL）等级：低/中/高
   - 总热量（千卡）
3. 风险评估：基于净碳水和升糖负荷给出风险等级（低/中/高）和对应的颜色代码（green/yellow/red）
4. 具体建议：提供3-5条针对糖尿病患者的行动建议
5. 免责声明

请确保返回纯JSON格式，不要包含其他文字。`

export async function analyzeImage(image: File, model: string = 'gemini-pro-vision') {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Gemini API密钥未配置')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const genModel = genAI.getGenerativeModel({ model })

  // 将图片转换为base64
  const imageBytes = await image.arrayBuffer()
  const base64Image = Buffer.from(imageBytes).toString('base64')

  const prompt = `${systemPrompt}

  图片数据：data:${image.type};base64,${base64Image}`

  try {
    const result = await genModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // 清理响应文本，提取JSON部分
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI返回格式不正确')
    }

    const parsedResult = JSON.parse(jsonMatch[0])

    // 验证必要字段
    const requiredFields = ['foods', 'nutrition', 'risk_level', 'recommendations']
    for (const field of requiredFields) {
      if (!parsedResult[field]) {
        throw new Error(`AI返回缺少必要字段: ${field}`)
      }
    }

    return parsedResult
  } catch (error) {
    console.error('AI分析错误:', error)
    
    // 返回模拟数据（开发环境使用）
    if (process.env.NODE_ENV === 'development') {
      return getMockData()
    }
    
    throw new Error('AI分析失败，请重试')
  }
}

// 开发环境使用的模拟数据
function getMockData() {
  return {
    foods: [
      {
        name: "白米饭",
        estimated_weight: "150g",
        nutrients: {
          carbs: 40,
          protein: 3,
          fat: 0
        }
      },
      {
        name: "清蒸鱼",
        estimated_weight: "120g",
        nutrients: {
          carbs: 0,
          protein: 25,
          fat: 5
        }
      },
      {
        name: "炒西兰花",
        estimated_weight: "100g",
        nutrients: {
          carbs: 4,
          protein: 2,
          fat: 1
        }
      }
    ],
    nutrition: {
      total_carbs: "44g",
      fiber: "6g",
      net_carbs: "38g",
      gl_level: "中",
      calories: "320kcal"
    },
    risk_level: "中",
    color_code: "yellow",
    recommendations: [
      "建议先吃蔬菜和蛋白质，再吃主食，有助于降低血糖波动",
      "米饭分量可以适当减少1/3，或替换为糙米",
      "餐后30分钟进行15-20分钟散步",
      "注意监测餐后2小时血糖"
    ],
    disclaimer: "本分析基于AI估算，仅供参考。实际营养值可能因烹饪方法和具体食材而异。请咨询专业医生或营养师获取个性化建议。"
  }
}
