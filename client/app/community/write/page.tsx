'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ChevronDown, Image as ImageIcon, X } from 'lucide-react';
import CloseButton from '@/app/component/common/CloseButton';

// 카테고리 옵션
const categoryOptions = [
  { value: 'question', label: '이거 어떻게 키워요?' },
  { value: 'daily', label: '일상' },
  { value: 'free', label: '자유 주제' },
  { value: 'plant', label: '식물별 카테고리' }
];

export default function WritePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('question');
  const [images, setImages] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = files.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement post submission logic
    console.log({ title, content, category, images });
    alert('게시글이 등록되었습니다.');
    router.push('/community');
  };
  
  const selectedCategoryLabel = categoryOptions.find(c => c.value === category)?.label;

  return (
    <div className="p-[18px] bg-[#FAF6EC] min-h-screen w-[393px] mx-auto flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[#023735] font-medium text-[20px]">글쓰기</h1>
        <CloseButton />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* 카테고리 선택 */}
        <div className="relative mb-[15px]">
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

        {/* 제목 입력 */}
        <div className="mb-[15px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#42CA71]"
          />
        </div>

        {/* 내용 입력 */}
        <div className="flex-1 mb-[15px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요."
            className="w-full h-full min-h-[300px] px-[15px] py-[10px] bg-white border border-[#E5E0D3] rounded-lg text-[#023735] text-[16px] placeholder:text-[#9CA3AF] resize-none focus:outline-none focus:ring-1 focus:ring-[#42CA71]"
          />
        </div>

        {/* 이미지 첨부 */}
        <div className="mb-[20px]">
          <div className="flex items-center gap-[10px] overflow-x-auto p-2">
            <label className="flex-shrink-0 w-[80px] h-[80px] bg-white border-2 border-dashed border-[#E5E0D3] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F2E8]">
              <Camera size={24} className="text-[#9CA3AF]" />
              <span className="text-[12px] text-[#9CA3AF] mt-1">{images.length}/10</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={images.length >= 10} />
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
          disabled={!title || !content}
          className="w-full py-[12px] bg-[#42CA71] text-white font-medium rounded-lg disabled:bg-[#A3D9B8] disabled:cursor-not-allowed"
        >
          등록하기
        </button>
      </form>
    </div>
  );
}
