import { getAuthToken } from '@/app/api/authController';

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'ngrok-skip-browser-warning': 'true', // ngrok 브라우저 경고 스킵
  };
};

const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface PlantDetailData {
  id: number;
  name: string;
  variety: string;
  img_url: string;
  cycle_type: string;
  cycle_value: string;
  cycle_unit: string;
  sunlight_needs: string;
  purchase_date: string;
  purchase_location: string;
  memo: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getPlantById(plantId: number): Promise<PlantDetailData | null> {
  try {
    const response = await fetch(`${url}/plants/${plantId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return null;
      }
      const data: PlantDetailData = await response.json();
      return data;
    } else if (response.status === 404) {
      console.warn(`Plant with ID ${plantId} not found.`);
      return null;
    } else {
      console.error('Failed to fetch plant details:', response.status, response.statusText);
      const text = await response.text();
      console.error('Error response:', text.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('Network error while fetching plant details:', error);
    return null;
  }
}
