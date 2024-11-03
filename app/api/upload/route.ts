//app\api\upload\route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// OpenAI API Key - Bu anahtarı güvenli bir şekilde saklamalısınız (örn. environment variables)
const API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('image') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Dosyayı base64'e çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Bu sınav kağıdındaki el yazısı ile yazılmış sınav notlarını alabilir misin? Eğer soru puanı yoksa ya da sadece soru üzerine çizgi çekildiyse puan 0 (sıfır) olur. Sadece soru numaralarını ve puanlarını JSON formatında gönder.{\"1\":\"5\",\"2\":\"7\"} gibi. Herhangi bir yorum yapma sadece sonucu göster"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              },
            }
          ]
        }
      ],
      max_tokens: 300
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const result = await response.json();
    
    if (result.choices && result.choices.length > 0) {
        const content = result.choices[0].message.content;
        // JSON string'i olduğu gibi döndür, client tarafında parse edilecek
        return NextResponse.json({ success: true, result: content });
      } else {
        return NextResponse.json({ success: false, message: 'No results found' }, { status: 404 });
      }

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ success: false, message: 'Failed to process image' }, { status: 500 });
  }
}