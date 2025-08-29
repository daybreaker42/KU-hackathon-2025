import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async translateToKorean(englishText: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `다음 영어 식물 이름을 한국어로 번역해주세요. 일반적으로 사용되는 한국어 이름으로 번역하고, 번역된 이름만 반환해주세요: "${englishText}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text().trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      // API 실패 시 원본 텍스트 반환
      return englishText;
    }
  }

  async analyzePlantCare(plantName: string): Promise<{
    wateringCycle: string;
    sunlightNeeds: string;
    careInstructions: string;
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `"${plantName}" 식물의 관리 방법에 대해 다음 정보를 제공해주세요:
1. 물주기 주기 (예: 7일)
2. 햇빛 필요량 (예: 직사광선, 간접광선, 반그늘)
3. 간단한 관리 팁

각 항목을 구분하여 간단명료하게 작성해주세요.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 응답을 파싱하여 구조화된 데이터로 변환
      const lines = text.split('\n').filter((line) => line.trim());

      return {
        wateringCycle: this.extractWateringCycle(text),
        sunlightNeeds: this.extractSunlightNeeds(text),
        careInstructions: text,
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      // 기본값 반환
      return {
        wateringCycle: '7',
        sunlightNeeds: '간접광선',
        careInstructions: '일반적인 식물 관리 방법을 따라주세요.',
      };
    }
  }

  private extractWateringCycle(text: string): string {
    const match = text.match(/(\d+)일/);
    return match ? match[1] : '7';
  }

  private extractSunlightNeeds(text: string): string {
    if (text.includes('직사광선')) return '직사광선';
    if (text.includes('간접광선')) return '간접광선';
    if (text.includes('반그늘')) return '반그늘';
    return '간접광선';
  }

  async generateTextWithSystemPrompt(userPrompt: string): Promise<string> {
    // 1. 사용할 모델 선택
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest', // 또는 'gemini-pro'
      // 2. 시스템 프롬프트 설정
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: `{"input":"Heptapleurum arboricola", "response":"홍콩야자"}
You are an AI that converts the input English plant name into Korean.
Convert the input plant name into Korean and return the response to the user.
The example is as above. However, when outputting, return only the Korean words, not the JSON format, and only the portion corresponding to the response value.
Return only the text "홍콩야자" without the quotes.`,
          },
        ],
      },
    });

    // 3. 사용자 프롬프트와 함께 요청 전송
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    return text;
  }
}
