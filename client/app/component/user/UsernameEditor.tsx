'use client';

import React, { useState } from 'react';
import { apiRequest } from '@/app/api/authController'; // authController 사용

interface UsernameEditorProps {
  currentUsername: string;
  onUsernameUpdateSuccess: (newUsername: string) => void;
}

export default function UsernameEditor({ currentUsername, onUsernameUpdateSuccess }: UsernameEditorProps) {
  const [newUsername, setNewUsername] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      setError('새 사용자 이름을 입력해주세요.');
      return;
    }

    setUpdatingName(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiRequest('/users/me/name', {
        method: 'PATCH',
        body: JSON.stringify({ name: newUsername }),
      }, true); // 인증 필요

      if (!response.ok) {
        throw new Error('사용자 이름 업데이트 실패');
      }

      onUsernameUpdateSuccess(newUsername); // 부모 컴포넌트에 성공 알림
      setSuccessMessage('사용자 이름이 성공적으로 변경되었습니다.');
      setIsEditingName(false); // 편집 모드 종료
      setNewUsername(''); // 입력 필드 초기화

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '사용자 이름 변경 중 오류가 발생했습니다.';
      console.error('사용자 이름 변경 오류:', err);
      setError(errorMessage);
    } finally {
      setUpdatingName(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600 mb-2">현재 사용자 이름</p>
        <div className="text-lg font-semibold text-[#023735] bg-gray-50 p-3 rounded-lg">
          {currentUsername}
        </div>
      </div>
      
      <div className="cursor-pointer hover:font-semibold p-2 border rounded-md text-center" onClick={() => setIsEditingName(!isEditingName)}>
        사용자 이름 바꾸기
      </div>
      {isEditingName && (
        <div className="mt-4 flex flex-col gap-2">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="새 사용자 이름"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
          <button
            onClick={handleUsernameUpdate}
            disabled={updatingName}
            className="p-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#45a049] disabled:opacity-50"
          >
            {updatingName ? '변경 중...' : '저장'}
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 text-center text-sm mt-2">{successMessage}</p>}
    </div>
  );
}