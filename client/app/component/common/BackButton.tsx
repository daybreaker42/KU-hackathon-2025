'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string; // 추가적인 스타일링을 위한 클래스명
  onClick?: () => void; // 커스텀 클릭 핸들러 (선택사항)
  size?: number; // 아이콘 크기
}

export default function BackButton({ 
  className = '', 
  onClick, 
  size = 20 
}: BackButtonProps) {
  const router = useRouter();

  // 기본 뒤로가기 핸들러
  const handleBack = () => {
    if (onClick) {
      onClick(); // 커스텀 핸들러가 있으면 실행
    } else {
      router.back(); // 기본 뒤로가기 동작
    }
  };

  return (
    <button 
      onClick={handleBack}
      className={`w-[54px] h-[54px] border border-[#E6DFD1] rounded-full flex items-center justify-center hover:bg-[#F0ECE0] transition-colors bg-transparent ${className}`} // 새 배경에 맞는 색상으로 설정
    >
      <ChevronLeft size={size} className="text-[#023735]" />
    </button>
  );
}
