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

// 식물 갤러리 이미지 조회 함수
export async function getPlantImages(): Promise<string[] | null> {
  try {
    const response = await fetch(`${url}/plants/images/all`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Gallery response is not JSON:', contentType);
        return null;
      }
      const data: string[] = await response.json();
      return data;
    } else {
      console.error('Failed to fetch plant gallery:', response.status, response.statusText);
      const text = await response.text();
      console.error('Gallery error response:', text.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('Network error while fetching plant gallery:', error);
    return null;
  }
}

// 식물 삭제 함수
export async function deletePlant(plantId: number): Promise<boolean> {
  try {
    const response = await fetch(`${url}/plants/${plantId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (response.ok) {
      console.log(`Plant ${plantId} deleted successfully`);
      return true;
    } else if (response.status === 404) {
      console.warn(`Plant with ID ${plantId} not found for deletion.`);
      throw new Error('식물을 찾을 수 없습니다.');
    } else if (response.status === 403) {
      console.warn(`No permission to delete plant ${plantId}.`);
      throw new Error('식물을 삭제할 권한이 없습니다.');
    } else {
      console.error('Failed to delete plant:', response.status, response.statusText);
      const text = await response.text();
      console.error('Delete error response:', text.substring(0, 200));
      throw new Error('식물 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('Network error while deleting plant:', error);
    if (error instanceof Error) {
      throw error; // 이미 정의된 에러 메시지 전달
    }
    throw new Error('네트워크 오류로 식물을 삭제할 수 없습니다.');
  }
}

// 여러 식물 삭제 함수
export async function deletePlants(plantIds: number[]): Promise<{ success: number[], failed: number[] }> {
  const results = { success: [] as number[], failed: [] as number[] };

  // 병렬로 삭제 요청 처리
  const deletePromises = plantIds.map(async (plantId) => {
    try {
      const success = await deletePlant(plantId);
      if (success) {
        results.success.push(plantId);
      } else {
        results.failed.push(plantId);
      }
    } catch (error) {
      console.error(`Failed to delete plant ${plantId}:`, error);
      results.failed.push(plantId);
    }
  });

  await Promise.all(deletePromises);
  return results;
}
