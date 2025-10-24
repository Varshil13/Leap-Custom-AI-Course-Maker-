import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/services/gemini';

async function generateWithRetry(prompt: string, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateAIResponse(prompt);
      return result;
    } catch (error: any) {
      console.error(`AI Generation Attempt ${attempt} Error:`, error);
      
      // If it's a 503 (overloaded) error and we have retries left
      if (error.status === 503 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's the last attempt or not a retryable error, throw
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt in request body.' }, { status: 400 });
    }
    
    const result = await generateWithRetry(prompt, 3);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    
    if (error.status === 503) {
      return NextResponse.json({ 
        error: 'AI service is temporarily overloaded. Please try again in a few minutes.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Failed to generate AI response.' }, { status: 500 });
  }
}
