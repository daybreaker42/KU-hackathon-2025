import { apiRequest } from "./authController";

export async function getPlant() {
  try {
    const response = await apiRequest("/plants", {
      method: "GET"
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching plant list:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching plant list:", error);
    throw error;
  }
}

export async function postDiary(data: {
  title: string;
  content: string;
  emotion: string;
  memory: Array<{id: number, memo: string}>;
  plant_id: number[]
  water: number[];
  sun: number[];
  images: File[];
}) {
  try {

    // 목업
    const req = {
      title: data.title,
      content: data.content,
      emotion: data.emotion,
      memory: data.memory[0].memo,
      plant_id: data.plant_id[0],
      images: data.images
    }

    let res;
    // 이미지가 있으면 먼저 이미지 업로드
    const images = [];
    if (req.images && req.images.length > 0) {
      // FormData를 사용하여 이미지 업로드
      const formData = new FormData();
      req.images.forEach((file, index) => {
        formData.append(`file`, file);
      });

      res = await apiRequest("/diaries/image", {
        method: "POST",
        body: formData
      }, true, true); // FormData 사용을 위해 isFormData=true 전달

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error uploading images:", errorData);
        throw new Error(errorData.message || "Unknown error");
      }

      const result = await res.json();
      images.push(result.imageUrl);
    }

    req.images = images;
    // 다이어리 데이터 전송
    const response = await apiRequest("/diaries", {
      method: "POST",
      body: JSON.stringify(req)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error posting diary:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error posting diary:", error);
    throw error;
  }
}