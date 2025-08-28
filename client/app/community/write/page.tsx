'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ChevronDown, X } from 'lucide-react';
import BackButton from '@/app/component/common/BackButton';
import { createCommunityPost, uploadImages, getMyPlants } from '@/app/api/communityController';

// 카테고리 옵션
type Category = 'question' | 'daily' | 'free' | 'plant';

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'question', label: '이거 어떻게 키워요?' },
  { value: 'daily', label: '일상' },
  { value: 'free', label: '자유 주제' },
  { value: 'plant', label: '식물별 카테고리' }
];

interface MyPlant {
  id: number;
  name: string;
}

export default function WritePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('question');
  const [images, setImages] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [myPlants, setMyPlants] = useState<MyPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchMyPlants = async () => {
      try {
        const plants = await getMyPlants();
        setMyPlants(plants.map(p => ({ id: p.id, name: p.name })));
      } catch (error) {
        console.error('내 식물 목록을 가져오는 데 실패했습니다:', error);
      }
    };
    fetchMyPlants();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      if (images.length + files.length > 10) {
        alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
        return;
      }

      const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);

      if (totalSize > MAX_UPLOAD_SIZE) {
        alert('총 파일 크기가 서버 제한(50MB)을 초과했습니다. 더 작은 파일들을 선택해 주세요.');
        return;
      }

      setIsUploading(true);
      try {
        const response = await uploadImages(files);
        setImages(prev => [...prev, ...response.imageUrls]);
      } catch (error) {
        console.error('이미지 업로드에 실패했습니다:', error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
      return;
    }

    try {
      await createCommunityPost({
        title,
        content,
        category,
        plant_name: category === 'plant' ? selectedPlant : undefined,
        images
      });
      alert('게시글이 성공적으로 등록되었습니다.');
      router.push('/community');
    } catch (error) {
      console.error('게시글 등록에 실패했습니다:', error);
      alert('게시글 등록에 실패했습니다.');
    }
  };
  
  const selectedCategoryLabel = categoryOptions.find(c => c.value === category)?.label;

  return (
    <div className="p-[18px] bg-[#FAF6EC] min-h-screen w-[393px] mx-auto flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-[20px]">
        <BackButton />
        <h1 className="text-[#023735] font-medium text-[18px] flex-1 text-center">새로운 글 작성하기</h1>
        <div className="w-[24px]"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* 카테고리 선택 */}
        <div className="mb-[15px]">
          <label className="block text-[#023735] font-medium text-[14px] mb-[8px]">
            카테고리 선택하기
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full flex justify-between items-center px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px]"
            >
              <span>{selectedCategoryLabel}</span>
              <ChevronDown size={20} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryDropdownOpen && (
              <ul className="absolute z-10 w-full mt-[5px] bg-white border border-[#E5E0D3] rounded-lg shadow-lg">
                {categoryOptions.map(option => (
                  <li
                    key={option.value}
                    onClick={() => {
                      setCategory(option.value);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="px-[15px] py-[10px] hover:bg-[#F5F2E8] cursor-pointer"
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 식물 선택 (카테고리가 'plant'일 경우) */}
        {category === 'plant' && (
          <div className="mb-[15px]">
            <label className="block text-[#023735] font-medium text-[14px] mb-[8px]">
              식물 선택하기
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
                className="w-full flex justify-between items-center px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px]"
              >
                <span>{selectedPlant || '내 식물 선택'}</span>
                <ChevronDown size={20} className={`transition-transform ${isPlantDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPlantDropdownOpen && (
                <ul className="absolute z-10 w-full mt-[5px] bg-white border border-[#E5E0D3] rounded-lg shadow-lg">
                  {myPlants.map(plant => (
                    <li
                      key={plant.id}
                      onClick={() => {
                        setSelectedPlant(plant.name);
                        setIsPlantDropdownOpen(false);
                      }}
                      className="px-[15px] py-[10px] hover:bg-[#F5F2E8] cursor-pointer"
                    >
                      {plant.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 제목 입력 */}
        <div className="mb-[15px]">
          <label className="block text-[#023735] font-medium text-[14px] mb-[8px]">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글 제목을 입력하세요..."
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
                <img src={image} alt={`upload-preview ${index}`} className="w-full h-full object-cover rounded-lg" />
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

        {/* 등록 버튼 */}
        <button
          type="submit"
          disabled={!title || !content || isUploading || (category === 'plant' && !selectedPlant)}
          className="w-full py-[12px] bg-[#42CA71] text-white font-medium rounded-lg disabled:bg-[#A3D9B8] disabled:cursor-not-allowed"
        >
          {isUploading ? '이미지 업로드 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
