import { NextResponse } from 'next/server'

export async function GET() {
  const isGeminiConfigured = !!process.env.GEMINI_API_KEY
  
  return NextResponse.json({
    status: 'healthy',
    service: 'diabetic-diet-analyzer',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    dependencies: {
      gemini: isGeminiConfigured ? 'configured' : 'missing',
    },
    timestamp: new Date().toISOString(),
  })
}
