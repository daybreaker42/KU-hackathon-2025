import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PlantIdentificationDto } from 'src/plant/dto/plant.dto';

export interface PlantIdentificationResult {
  name: string;
  probability: number;
  similar_images: string[];
}

@Injectable()
export class PlantIdService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://plant.id/api/v3/identification';
  private genAI: GoogleGenerativeAI;

  constructor() {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(geminiApiKey);

    const plantIdApiKey = process.env.PLANT_ID_API_KEY;
    if (!plantIdApiKey) {
      throw new Error('PLANT_ID_API_KEY is not defined in environment variables');
    }
    this.apiKey = plantIdApiKey;
  }

  async identifyPlant(imageUrl: string): Promise<PlantIdentificationDto> {
    try {
      // imageUrl로 axios 요청, base64 인코딩 필요

      const base64Image = await this.encodeImageToBase64(imageUrl);
      const response = await axios.post(
        this.baseUrl,
        {
          images: [base64Image],
          similar_images: true,
          // plant_details: ['common_names'],
        },
        {
          headers: {
            'Api-Key': this.apiKey,
          },
        },
      );

      const plantName = response.data.result.classification.suggestions[0].name || '식물';
      console.log('-----');
      console.log(plantName);
      console.log('-----');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const suggestions = response.data.result.classification
        .suggestions as PlantIdentificationResult[];
      if (suggestions.length === 0) {
        throw new Error('식물을 식별할 수 없습니다.');
      }
      const topSuggestion = suggestions[0];
      return {
        name: topSuggestion.name,
        // koreanName: '', // 한국어 이름은 추후 Gemini API로 번역하여 채울 예정
        koreanName: await this.generateTextWithSystemPrompt(plantName),
        probability: topSuggestion.probability,
        careInfo: {
          wateringCycle: '',
          sunlightNeeds: '',
          careInstructions: '',
        }, // 관리 정보는 추후 Gemini API로 채울 예정
      };
    } catch (error) {
      console.error('Plant.ID API Error:', error.response?.data || error.message);
      throw new Error('식물 식별에 실패했습니다.');
    }
  }

  private async encodeImageToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
      });
      const base64 = Buffer.from(response.data).toString('base64');
      const contentType = (response.headers['content-type'] as string) || 'image/jpeg';
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error(
        'Image Encoding Error:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw new Error('이미지 인코딩에 실패했습니다.');
    }
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
