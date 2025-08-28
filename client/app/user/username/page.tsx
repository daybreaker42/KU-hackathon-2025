'use client';

import BackButton from '@/app/component/common/BackButton';
import UsernameEditor from '@/app/component/user/UsernameEditor';
import { useState } from 'react'; // Needed for local state in this page

export default function UsernamePage() {
  const [currentUsername, setCurrentUsername] = useState('사용자 이름'); // Initial placeholder or fetch actual username

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
      <div className="flex-1 overflow-y-auto p-[18px]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
        <header className="relative flex items-center justify-center mb-8">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">사용자 이름 변경</h1>
        </header>

        <main className='bg-[#FAF6EC]' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          <div className="max-w-md mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium text-[#023735] mb-4">새로운 사용자 이름 설정</h3>
              
              <UsernameEditor
                currentUsername={currentUsername}
                onUsernameUpdateSuccess={setCurrentUsername}
              />
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-[#023735] mb-2">사용자 이름 가이드</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 2자 이상 20자 이하</li>
                <li>• 한글, 영문, 숫자 사용 가능</li>
                <li>• 특수문자는 언더바(_), 하이픈(-) 만 허용</li>
                <li>• 공백은 사용할 수 없습니다</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}