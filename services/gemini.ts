import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import 'dotenv/config';

type AIFile = {
  filename: string;
  mimeType: string;
  dataBase64: string; // keep as base64 so it’s easy to return via JSON
};

export async function generateAIResponse(prompt: string): Promise<{
  text: string;
  files: AIFile[];
}> {
 
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = 'gemini-2.5-flash';

  const response = await ai.models.generateContentStream({
    model,
    config: { temperature: 0.9, responseModalities: ['TEXT'] },
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
  });

  let text = '';
  const files: AIFile[] = [];
  let fileIndex = 0;

  for await (const chunk of response) {
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      if (chunk.text) text += chunk.text;
      continue;
    }

    const part = parts[0];

    // Collect text
    if (chunk.text) text += chunk.text;

    // Collect inline binary, if any
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType || 'application/octet-stream';
      const ext = mime.getExtension(mimeType) || 'bin';
      const filename = `gemini_${fileIndex++}.${ext}`;

      files.push({
        filename,
        mimeType,
        dataBase64: part.inlineData.data || '',
      });
    }
  }

  return { text, files };
}