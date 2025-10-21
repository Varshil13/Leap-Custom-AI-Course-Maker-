import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/services/gemini';

export async function POST(request: NextRequest) {
  try {
    const { userInputPrompt } = await request.json();
    if (!userInputPrompt) {
      return NextResponse.json({ error: 'Missing prompt in request body.' }, { status: 400 });
    }
    const result = await generateAIResponse(userInputPrompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI response.' }, { status: 500 });
  }
}
