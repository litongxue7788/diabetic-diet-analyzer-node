import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const runtime = 'nodejs'

const NUTRIENT_TABLE: Record<string, { carbs: number; protein: number; fat: number; fiber?: number; calories?: number }> = {
  '橙子': { carbs: 12, protein: 0.9, fat: 0.2, fiber: 2.4, calories: 47 },
  '橘子': { carbs: 12, protein: 0.9, fat: 0.2, fiber: 2.4, calories: 47 },
  '水饺': { carbs: 30, protein: 7, fat: 6, fiber: 1.5, calories: 230 },
  '饺子': { carbs: 30, protein: 7, fat: 6, fiber: 1.5, calories: 230 },
  '米饭': { carbs: 28, protein: 2.7, fat: 0.3, fiber: 0.4, calories: 130 },
  '面包': { carbs: 49, protein: 9, fat: 3.2, fiber: 2.7, calories: 265 },
  '苹果': { carbs: 14, protein: 0.3, fat: 0.2, fiber: 2.4, calories: 52 },
  '香蕉': { carbs: 23, protein: 1.1, fat: 0.3, fiber: 2.6, calories: 96 }
}

function parseWeightToGrams(v: any): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  const s = String(v)
  const m = s.match(/([0-9]+(\.[0-9]+)?)/)
  if (!m) return 0
  const n = parseFloat(m[0])
  if (/kg|千克/i.test(s)) return n * 1000
  return n
}

export async function POST(request: NextRequest) {
  try {
    

    // 获取表单数据
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const modelName = formData.get('model') as string || 'gemini-pro-vision';
    const overrideApiKey = (formData.get('apiKey') as string) || '';
    const overrideBaseUrl = (formData.get('baseUrl') as string) || '';

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

    const prompt = `你是一位糖尿病临床营养师。请严格用中文，仅返回 JSON（不要任何代码块或额外说明），并确保所有数值为数字且填写完整，不要留空。
要求：
1) 识别所有食物并估算重量(g)，字段：foods[].name，foods[].estimated_weight
2) 为每个食物给出营养素估算（若不确定请依据常见食物数据库进行合理估算并标注为估算值）：foods[].nutrients.carbs、foods[].nutrients.protein、foods[].nutrients.fat、foods[].nutrients.fiber（单位均为g）
3) 汇总 nutrition 字段，包含：total_carbs、fiber、net_carbs（= total_carbs - fiber）、gl_level（低/中/高）、calories（千卡，按4*carbs+4*protein+9*fat近似计算）
4) 给出 risk_level（低/中/高）、recommendations（数组，具体可操作建议）、disclaimer（简短免责声明）
仅返回以上 JSON 字段：foods、nutrition（包含 total_carbs、fiber、net_carbs、gl_level、calories）、risk_level、recommendations、disclaimer。`;

    const dataUrl = `data:${image.type};base64,${base64Image}`;
    let text = '';
    const provider = modelName.startsWith('gemini') ? 'google' 
      : modelName.startsWith('qwen') ? 'ali' 
      : modelName.startsWith('deepseek') ? 'deepseek' 
      : modelName.startsWith('yi') ? 'yi'
      : modelName.startsWith('glm') ? 'zhipu'
      : modelName.startsWith('doubao') ? 'doubao'
      : 'google';
    
    const overrideEndpoint = (formData.get('endpoint') as string) || '';

    console.error(`[Analyze] Starting analysis with model: ${modelName}, provider: ${provider}`);

    if (provider === 'google') {
      const googleKey = overrideApiKey || process.env.GEMINI_API_KEY;
      if (!googleKey) {
        return NextResponse.json({ success: false, error: 'GEMINI_API_KEY 未配置' }, { status: 400 });
      }
      console.error('[Analyze] Calling Google Gemini...');
      const localGenAI = new GoogleGenerativeAI(googleKey);
      const model = localGenAI.getGenerativeModel({ model: modelName });
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
      text = await response.text();
      console.error('[Analyze] Gemini response length:', text.length);
    } else if (provider === 'ali') {
      const aliKey = overrideApiKey || process.env.ALI_API_KEY;
      if (!aliKey) {
        return NextResponse.json({ success: false, error: 'ALI_API_KEY 未配置' }, { status: 400 });
      }
      const baseUrl = (overrideBaseUrl || process.env.ALI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1');
      console.error(`[Analyze] Calling Ali Qwen at ${baseUrl}...`);
      
      const aliRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${aliKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });

      if (!aliRes.ok) {
        const errText = await aliRes.text();
        console.error('[Analyze] Ali API Error:', aliRes.status, errText);
        throw new Error(`Ali API Error (${aliRes.status}): ${errText}`);
      }

      const aliJson = await aliRes.json();
      const aliContent = aliJson.choices?.[0]?.message?.content;
      if (Array.isArray(aliContent)) {
        text = aliContent.map((c: any) => c.text || c.content || '').join('');
      } else {
        text = aliContent || aliJson.output_text || JSON.stringify(aliJson);
      }
      console.error('[Analyze] Ali response length:', text.length);
    } else if (provider === 'deepseek') {
      const deepseekKey = overrideApiKey || process.env.DEEPSEEK_API_KEY;
      if (!deepseekKey) {
        return NextResponse.json({ success: false, error: 'DEEPSEEK_API_KEY 未配置' }, { status: 400 });
      }
      
      // Allow custom base URL for DeepSeek (e.g. for local vLLM or compatible proxies that support vision)
      // Default to official API
      const dsBaseUrl = (overrideBaseUrl || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
      console.error(`[Analyze] Calling DeepSeek at ${dsBaseUrl}...`);
      
      // DeepSeek V3/R1 official API is text-only. Sending images will result in 400 Error.
      // However, if the user provides a custom URL, it might support images.
      // We will try sending the image. If it fails with 400, we will throw a clear error
      // instead of falling back to text-only (which causes hallucinations).
      
      const dsRes = await fetch(`${dsBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${deepseekKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName || 'deepseek-chat', 
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } }
              ],
            },
          ],
          stream: false
        }),
      });

      if (!dsRes.ok) {
        const errText = await dsRes.text();
        console.error('[Analyze] DeepSeek API Error:', dsRes.status, errText);
        
        if (dsRes.status === 400 && errText.includes('image_url')) {
           // Return a structured error for the frontend to display nicely
           return NextResponse.json(
             { success: false, error: 'DeepSeek 官方API暂不支持图片分析。请使用阿里通义千问(Qwen)或Gemini，或在页面填写支持视觉的自定义DeepSeek端点(Base URL)。' },
             { status: 400 }
           );
        }
        throw new Error(`DeepSeek API Error (${dsRes.status}): ${errText}`);
      }

      const dsJson = await dsRes.json();
      console.error('[Analyze] DeepSeek Response JSON:', JSON.stringify(dsJson).substring(0, 200) + '...');
      text = dsJson.choices?.[0]?.message?.content || JSON.stringify(dsJson);
      console.error('[Analyze] DeepSeek response length:', text.length);
    } else if (provider === 'yi') {
      const yiKey = overrideApiKey || process.env.YI_API_KEY;
      if (!yiKey) {
        return NextResponse.json({ success: false, error: 'YI_API_KEY 未配置' }, { status: 400 });
      }
      console.error('[Analyze] Calling Yi-Vision...');
      
      const yiRes = await fetch('https://api.lingyiwanwu.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${yiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'yi-vision',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
          stream: false
        }),
      });

      if (!yiRes.ok) {
        const errText = await yiRes.text();
        console.error('[Analyze] Yi API Error:', yiRes.status, errText);
        throw new Error(`Yi API Error (${yiRes.status}): ${errText}`);
      }

      const yiJson = await yiRes.json();
      text = yiJson.choices?.[0]?.message?.content || JSON.stringify(yiJson);
      console.error('[Analyze] Yi response length:', text.length);
    } else if (provider === 'zhipu') {
      const zhipuKey = overrideApiKey || process.env.ZHIPU_API_KEY;
      if (!zhipuKey) {
        return NextResponse.json({ success: false, error: 'ZHIPU_API_KEY 未配置' }, { status: 400 });
      }
      
      console.error('[Analyze] Calling Zhipu GLM-4V...');
      // Using Zhipu V4 API (OpenAI Compatible)
      const zhipuRes = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${zhipuKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'glm-4v',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } }
              ],
            }
          ],
          stream: false
        })
      });

      if (!zhipuRes.ok) {
         const err = await zhipuRes.text();
         console.error('[Analyze] Zhipu Error:', err);
         throw new Error(`Zhipu API Error: ${err}`);
      }
      const zhipuJson = await zhipuRes.json();
      text = zhipuJson.choices?.[0]?.message?.content || '';
      console.error('[Analyze] Zhipu response length:', text.length);

    } else if (provider === 'doubao') {
      const doubaoKey = overrideApiKey || process.env.DOUBAO_API_KEY;
      if (!doubaoKey) {
        return NextResponse.json({ success: false, error: 'DOUBAO_API_KEY (Volcengine) 未配置' }, { status: 400 });
      }
      
      const endpointId = overrideEndpoint || process.env.DOUBAO_ENDPOINT_ID;
      if (!endpointId) {
        return NextResponse.json({ success: false, error: 'Doubao Endpoint ID 未配置 (请在页面填写)' }, { status: 400 });
      }

      console.error(`[Analyze] Calling Doubao at endpoint ${endpointId}...`);
      
      // Volcengine Ark (Doubao) OpenAI Compatible Endpoint
      const doubaoRes = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doubaoKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: endpointId, 
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } }
              ],
            }
          ],
          stream: false
        })
      });

      if (!doubaoRes.ok) {
         const err = await doubaoRes.text();
         console.error('[Analyze] Doubao Error:', err);
         
         if (doubaoRes.status === 401 && err.includes('API key format is incorrect')) {
           return NextResponse.json(
             {
               success: false,
               error: '豆包 API Key 格式不正确。请在环境变量 DOUBAO_API_KEY 中填写 Ark 控制台生成的 API Key（不要包含 Bearer 前缀）。'
             },
             { status: 400 }
           );
         }
         
         throw new Error(`Doubao API Error: ${err}`);
      }
      const dbJson = await doubaoRes.json();
      text = dbJson.choices?.[0]?.message?.content || '';
      console.error('[Analyze] Doubao response length:', text.length);
    }

    if (!text) {
      console.error('[Analyze] Error: Model returned empty text');
      throw new Error('模型未返回任何内容');
    }

    // Clean markdown code blocks if present (common in AI responses)
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');

    console.error('[Analyze] Raw response text preview:', text.substring(0, 100));

    // 尝试解析JSON并规范化为前端所需结构
    let data;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : text);

      const normalize = (input: any) => {
        if (input && input.food_analysis) {
          const fa = input.food_analysis;
          const foods = Array.isArray(fa.foods)
            ? fa.foods.map((f: any) => ({
                name: f.name || '未知食物',
                estimated_weight: f.quantity || f.estimated_weight || '--',
                nutrients: f.nutritional_info
                  ? {
                      carbs: parseFloat(String(f.nutritional_info.total_carbohydrates || '').replace(/[^0-9.]/g, '')) || 0,
                      protein: f.nutritional_info.protein
                        ? parseFloat(String(f.nutritional_info.protein).replace(/[^0-9.]/g, ''))
                        : 0,
                      fat: f.nutritional_info.fat
                        ? parseFloat(String(f.nutritional_info.fat).replace(/[^0-9.]/g, ''))
                        : 0,
                    }
                  : undefined,
              }))
            : [];

          const assess = fa.gi_gl_assessment || fa.gi_gl || {};
          const cat = assess.category || fa.total_nutrition?.overall_gi_gl_category || '中';
          const color = cat === '低' ? 'green' : cat === '高' ? 'red' : 'yellow';
          const glVal = assess.total_glycemic_load || assess.glycemic_load || assess.overall_gl || fa.total_nutrition?.total_glycemic_load || cat;

          const nutrition = {
            total_carbs: fa.total_nutrition?.total_carbohydrates || '--',
            fiber: fa.total_nutrition?.dietary_fiber || '--',
            net_carbs: fa.total_nutrition?.net_carbohydrates || '--',
            gl_level: String(glVal),
            calories: String(fa.total_nutrition?.calories || '--'),
          };

          const rec = input.recommendations || {};
          const generalTips: string[] = rec.general_tips || [];
          const specificItems: any[] = rec.specific_recommendations || rec.specific_suggestions || [];
          const extra: string[] = [rec.general_advice, rec.meal_timing, rec.monitoring].filter(Boolean);
          const specific: string[] = specificItems.map((r: any) => r?.suggestion || r).filter(Boolean);
          const general: string[] = [...generalTips, ...extra];

          const filledFoods = foods.map((food: any) => {
            if (food.nutrients && (food.nutrients.carbs || food.nutrients.protein || food.nutrients.fat)) return food
            const name = String(food.name || '').toLowerCase()
            const weight = parseWeightToGrams(food.estimated_weight)
            let ref: any = null
            Object.keys(NUTRIENT_TABLE).forEach(k => {
              if (name.includes(k.toLowerCase())) ref = NUTRIENT_TABLE[k]
            })
            if (!ref || !weight) return food
            const factor = weight / 100
            return {
              ...food,
              nutrients: {
                carbs: +(ref.carbs * factor).toFixed(1),
                protein: +(ref.protein * factor).toFixed(1),
                fat: +(ref.fat * factor).toFixed(1)
              }
            }
          })
          const totals = filledFoods.reduce((acc: any, f: any) => {
            const w = parseWeightToGrams(f.estimated_weight)
            const name = String(f.name || '').toLowerCase()
            let ref: any = null
            Object.keys(NUTRIENT_TABLE).forEach(k => {
              if (name.includes(k.toLowerCase())) ref = NUTRIENT_TABLE[k]
            })
            if (f.nutrients) {
              acc.carbs += f.nutrients.carbs || 0
              acc.protein += f.nutrients.protein || 0
              acc.fat += f.nutrients.fat || 0
            } else if (ref && w) {
              const factor = w / 100
              acc.carbs += ref.carbs * factor
              acc.protein += ref.protein * factor
              acc.fat += ref.fat * factor
              acc.fiber += (ref.fiber || 0) * factor
            }
            return acc
          }, { carbs: 0, protein: 0, fat: 0, fiber: 0 })
          const totalCarbs = totals.carbs > 0 ? `${totals.carbs.toFixed(1)}g` : nutrition.total_carbs
          const totalFiber = totals.fiber > 0 ? `${totals.fiber.toFixed(1)}g` : nutrition.fiber
          const netCarbsVal = (() => {
            const c = parseFloat(String(totalCarbs).replace(/[^0-9.]/g, '')) || 0
            const f = parseFloat(String(totalFiber).replace(/[^0-9.]/g, '')) || 0
            return (c - f)
          })()
          const caloriesVal = totals.carbs * 4 + totals.protein * 4 + totals.fat * 9
          const glLevel = netCarbsVal <= 30 ? '低' : netCarbsVal <= 60 ? '中' : '高'
          return {
            foods: filledFoods,
            nutrition: {
              total_carbs: totalCarbs,
              fiber: totalFiber,
              net_carbs: `${netCarbsVal.toFixed(1)}g`,
              gl_level: String(glLevel),
              calories: caloriesVal > 0 ? `${caloriesVal.toFixed(0)}kcal` : nutrition.calories
            },
            risk_level: cat,
            color_code: color,
            recommendations: [...general, ...specific].length > 0 ? [...general, ...specific] : ['建议保持均衡饮食', '注意控制碳水摄入'],
            disclaimer: '本分析仅供参考，不能替代专业医疗建议。如有需要请咨询医生或营养师。',
          }
        }

        if (input && (input.foods || input.nutrition)) {
           const foods = Array.isArray(input.foods) ? input.foods.map((f: any) => ({
             name: f.name || '未知食物',
             estimated_weight: f.estimated_weight || f.weight || '--',
             nutrients: f.nutrients
               ? {
                   carbs: parseFloat(String(f.nutrients.carbs || '').replace(/[^0-9.]/g, '')) || 0,
                   protein: parseFloat(String(f.nutrients.protein || '').replace(/[^0-9.]/g, '')) || 0,
                   fat: parseFloat(String(f.nutrients.fat || '').replace(/[^0-9.]/g, '')) || 0
                 }
               : undefined
           })) : []
           const filledFoods = foods.map((food: any) => {
             if (food.nutrients && (food.nutrients.carbs || food.nutrients.protein || food.nutrients.fat)) return food
             const name = String(food.name || '').toLowerCase()
             const weight = parseWeightToGrams(food.estimated_weight)
             let ref: any = null
             Object.keys(NUTRIENT_TABLE).forEach(k => {
               if (name.includes(k.toLowerCase())) ref = NUTRIENT_TABLE[k]
             })
             if (!ref || !weight) return food
             const factor = weight / 100
             return {
               ...food,
               nutrients: {
                 carbs: +(ref.carbs * factor).toFixed(1),
                 protein: +(ref.protein * factor).toFixed(1),
                 fat: +(ref.fat * factor).toFixed(1)
               }
             }
           })
           const totals = filledFoods.reduce((acc: any, f: any) => {
             if (f.nutrients) {
               acc.carbs += f.nutrients.carbs || 0
               acc.protein += f.nutrients.protein || 0
               acc.fat += f.nutrients.fat || 0
             } else {
               const w = parseWeightToGrams(f.estimated_weight)
               const name = String(f.name || '').toLowerCase()
               let ref: any = null
               Object.keys(NUTRIENT_TABLE).forEach(k => {
                 if (name.includes(k.toLowerCase())) ref = NUTRIENT_TABLE[k]
               })
               if (ref && w) {
                 const factor = w / 100
                 acc.carbs += ref.carbs * factor
                 acc.protein += ref.protein * factor
                 acc.fat += ref.fat * factor
                 acc.fiber += (ref.fiber || 0) * factor
               }
             }
             return acc
           }, { carbs: 0, protein: 0, fat: 0, fiber: 0 })
           const currentNutrition = input.nutrition || {}
           const totalCarbs = totals.carbs > 0 ? `${totals.carbs.toFixed(1)}g` : (currentNutrition.total_carbs || '--')
           const totalFiber = totals.fiber > 0 ? `${totals.fiber.toFixed(1)}g` : (currentNutrition.fiber || '--')
           const netCarbsVal = (() => {
             const c = parseFloat(String(totalCarbs).replace(/[^0-9.]/g, '')) || 0
             const f = parseFloat(String(totalFiber).replace(/[^0-9.]/g, '')) || 0
             return (c - f)
           })()
           const caloriesVal = totals.carbs * 4 + totals.protein * 4 + totals.fat * 9
           const glLevel = netCarbsVal <= 30 ? '低' : netCarbsVal <= 60 ? '中' : '高'
           return {
             foods: filledFoods,
             nutrition: {
               total_carbs: totalCarbs,
               fiber: totalFiber,
               net_carbs: netCarbsVal > 0 ? `${netCarbsVal.toFixed(1)}g` : (currentNutrition.net_carbs || '--'),
               gl_level: currentNutrition.gl_level || String(glLevel),
               calories: caloriesVal > 0 ? `${caloriesVal.toFixed(0)}kcal` : (currentNutrition.calories || '--'),
             },
             risk_level: input.risk_level || String(glLevel),
             color_code: input.color_code || (String(glLevel) === '低' ? 'green' : String(glLevel) === '高' ? 'red' : 'yellow'),
             recommendations: input.recommendations || ['建议适度控制碳水摄入', '增加蔬菜和优质蛋白比例'],
             disclaimer: input.disclaimer || '本分析为基于图片与常见营养数据库的估算，不能替代专业医疗建议。'
           }
        }

        return { analysis: typeof input === 'string' ? input : JSON.stringify(input, null, 2) };
      };

      data = normalize(parsed);
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
