'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Camera, ChevronDown, X } from 'lucide-react';
import BackButton from '@/app/component/common/BackButton';
import { getCommunityPostById, updateCommunityPost, uploadImages, getMyPlants } from '@/app/api/communityController';
import { getCurrentUser } from '@/app/api/authController';
import type { CommunityCategory } from '@/app/types/community/community';

// 카테고리 옵션
const categoryOptions: { value: CommunityCategory; label: string }[] = [
  { value: 'question', label: '이거 어떻게 키워요?' },
  { value: 'daily', label: '일상' },
  { value: 'free', label: '자유 주제' },
  { value: 'plant', label: '식물별 카테고리' }
];

interface MyPlant {
  id: number;
  name: string;
  variety: string;
}

interface UpdatePostData {
  title?: string;
  content?: string;
  category?: string;
  plant_name?: string;
  images?: string[];
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('question');
  const [images, setImages] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [myPlants, setMyPlants] = useState<MyPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<MyPlant | null>(null);
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; name: string } | null>(null);

  useEffect(() => {
    // 현재 사용자 정보 가져오기
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    // 게시글 데이터와 내 식물 목록을 가져오는 함수
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 병렬로 데이터 가져오기
        const [postData, plantsData] = await Promise.all([
          getCommunityPostById(postId),
          getMyPlants()
        ]);

        // 권한 확인 - 현재 사용자가 게시글 작성자인지 확인
        const user = getCurrentUser();
        if (!user || !postData.author || postData.author.id !== user.id) {
          alert('이 게시글을 수정할 권한이 없습니다.');
          router.push('/community');
          return;
        }

        // 게시글 데이터 설정
        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.category as CommunityCategory);
        setImages(postData.images || []);

        // 내 식물 목록 설정
        const plants = plantsData.map(p => ({ id: p.id, name: p.name, variety: p.variety }));
        setMyPlants(plants);

        // 선택된 식물 설정 (plant 카테고리인 경우)
        if (postData.category === 'plant' && postData.plant_name) {
          const plant = plants.find(p => p.name === postData.plant_name);
          if (plant) {
            setSelectedPlant(plant);
          }
        }

      } catch (error) {
        console.error('데이터를 가져오는 데 실패했습니다:', error);
        alert('게시글을 불러오는 데 실패했습니다.');
        router.push('/community');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId, router]);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
      return;
    }

    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const uploadResponse = await uploadImages(fileArray);
      const uploadedUrls = uploadResponse.imageUrls || [];
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 카테고리 선택
  const handleCategorySelect = (selectedCategory: CommunityCategory) => {
    setCategory(selectedCategory);
    setIsCategoryDropdownOpen(false);
    if (selectedCategory !== 'plant') {
      setSelectedPlant(null);
    }
  };

  // 식물 선택
  const handlePlantSelect = (plant: MyPlant) => {
    setSelectedPlant(plant);
    setIsPlantDropdownOpen(false);
  };

  // 게시글 수정 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (category === 'plant' && !selectedPlant) {
      alert('식물을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    try {
      const updateData: UpdatePostData = {
        title: title.trim(),
        content: content.trim(),
        category,
        images: images.length > 0 ? images : undefined,
      };

      // plant 카테고리인 경우 plant_name 추가
      if (category === 'plant' && selectedPlant) {
        updateData.plant_name = selectedPlant.name;
      }

      await updateCommunityPost(postId, updateData);
      alert('게시글이 수정되었습니다.');
      router.push(`/community/post/${postId}`);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert(error instanceof Error ? error.message : '게시글 수정에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#42CA71] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">게시글을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-[18px] bg-[#FAF6EC] border-b border-[#E5E0D3]">
        <BackButton />
        <h1 className="text-[#023735] font-semibold text-[18px]">게시글 수정</h1>
        <div className="w-[24px]"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      {/* 폼 내용 */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-[18px] py-[20px] overflow-y-auto">
        {/* 카테고리 선택 */}
        <div className="mb-[20px]">
          <label className="block text-[#023735] font-medium text-[14px] mb-[8px]">
            카테고리
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px] flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#42CA71]"
            >
              <span>{categoryOptions.find(opt => opt.value === category)?.label}</span>
              <ChevronDown size={20} className={`text-[#9CA3AF] transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E0D3] rounded-lg shadow-lg z-10">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCategorySelect(option.value)}
                    className="w-full px-[15px] py-[10px] text-left text-[#023735] hover:bg-[#F5F2E8] first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 식물 선택 (plant 카테고리인 경우만) */}
        {category === 'plant' && (
          <div className="mb-[20px]">
            <label className="block text-[#023735] font-medium text-[14px] mb-[8px]">
              식물 선택
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
                className="w-full px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px] flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#42CA71]"
              >
                <span>{selectedPlant ? `${selectedPlant.name} (${selectedPlant.variety})` : '식물을 선택하세요'}</span>
                <ChevronDown size={20} className={`text-[#9CA3AF] transition-transform ${isPlantDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPlantDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E0D3] rounded-lg shadow-lg z-10 max-h-[200px] overflow-y-auto">
                  {myPlants.map((plant) => (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => handlePlantSelect(plant)}
                      className="w-full px-[15px] py-[10px] text-left text-[#023735] hover:bg-[#F5F2E8] first:rounded-t-lg last:rounded-b-lg"
                    >
                      {plant.name} ({plant.variety})
                    </button>
                  ))}
                  {myPlants.length === 0 && (
                    <div className="px-[15px] py-[10px] text-[#9CA3AF] text-center">
                      등록된 식물이 없습니다
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 제목 입력 */}
        <div className="mb-[20px]">
          <label className="block text-[#023735] font-medium text-[14px] mb-[8px]">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요..."
            className="w-full px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#42CA71]"
          />
        </div>

        {/* 내용 입력 */}
        <label className="block text-[#023735] font-medium text-[14px] mb-[8px]">
          내용
        </label>
        <div className="flex-1 mb-[15px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            className="w-full h-full min-h-[300px] px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px] placeholder:text-[#9CA3AF] resize-none focus:outline-none focus:ring-1 focus:ring-[#42CA71]"
          />
        </div>

        {/* 이미지 첨부 */}
        <div className="mb-[20px]">
          <h2 className="text-[#023735] font-medium text-[14px] mb-[8px]">이미지 첨부하기</h2>
          <div className="flex items-center gap-[10px] overflow-x-auto p-2">
            <label className={`flex-shrink-0 w-[80px] h-[80px] bg-white border-2 border-dashed border-[#E5E0D3] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F2E8] ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isUploading ? (
                <div className="text-sm text-gray-500">로딩중</div>
              ) : (
                <>
                  <Camera size={24} className="text-[#9CA3AF]" />
                  <span className="text-[12px] text-[#9CA3AF] mt-1">{images.length}/10</span>
                </>
              )}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={images.length >= 10 || isUploading} />
            </label>
            {images.map((image, index) => (
              <div key={index} className="relative flex-shrink-0 w-[80px] h-[80px]">
                <Image 
                  src={image} 
                  alt={`upload-preview ${index}`} 
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-lg" 
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-[-5px] right-[-5px] w-[20px] h-[20px] bg-gray-800 text-white rounded-full flex items-center justify-center text-[12px]"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 수정 완료 버튼 */}
        <button
          type="submit"
          disabled={!title || !content || isUploading || (category === 'plant' && !selectedPlant)}
          className="w-full py-[12px] bg-[#42CA71] text-white font-medium rounded-lg disabled:bg-[#A3D9B8] disabled:cursor-not-allowed"
        >
          {isUploading ? '수정 중...' : '수정 완료'}
        </button>
      </form>
    </div>
  );
}
