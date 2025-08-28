// app/friends/page.tsx
'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/app/component/common/BackButton';
import { getFriendsList, searchUsers, sendFriendRequest, Friend } from '@/app/api/friendsController'; // Import sendFriendRequest
import Image from 'next/image';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [sendingRequestId, setSendingRequestId] = useState<number | null>(null);
  const [requestStatus, setRequestStatus] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);

  // Effect to fetch initial friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriendsList();
        setFriends(data);
      } catch (err: any) {
        setError(err.message || '친구 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // Effect to handle search query changes with debounce
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]); // Clear search results if query is empty
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    const handler = setTimeout(async () => {
      try {
        const data = await searchUsers(searchQuery);
        setSearchResults(data);
      } catch (err: any) {
        setSearchError(err.message || '사용자 검색에 실패했습니다.');
      } finally {
        setSearchLoading(false);
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleSendRequest = async (friendId: number) => {
    setSendingRequestId(friendId);
    setRequestStatus(null); // Clear previous status

    try {
      const response = await sendFriendRequest(friendId);
      setRequestStatus({ id: friendId, message: response.message, type: 'success' });
      // Optionally, refresh the list or update friend status in state
    } catch (err: any) {
      setRequestStatus({ id: friendId, message: err.message || '친구 요청 실패', type: 'error' });
    } finally {
      setSendingRequestId(null);
      setTimeout(() => setRequestStatus(null), 3000); // Clear status message after 3 seconds
    }
  };

  const displayList = searchQuery.trim() === '' ? friends : searchResults;
  const currentLoading = searchQuery.trim() === '' ? loading : searchLoading;
  const currentError = searchQuery.trim() === '' ? error : searchError;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <div className="flex-1 overflow-y-auto p-[18px]">
        <header className="relative flex items-center justify-center mb-4">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">친구 목록</h1>
        </header>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="ID, 이름 또는 이메일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <main className='bg-transparent bg-none' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          {currentLoading && (
            <div className="text-center text-gray-600">
              {searchQuery.trim() === '' ? '친구 목록을 불러오는 중...' : '사용자 검색 중...'}
            </div>
          )}

          {currentError && (
            <div className="text-center text-red-500">{currentError}</div>
          )}

          {!currentLoading && !currentError && displayList.length === 0 && (
            <div className="text-center text-gray-600">
              {searchQuery.trim() === '' ? '아직 친구가 없습니다.' : '검색 결과가 없습니다.'}
            </div>
          )}

          {!currentLoading && !currentError && displayList.length > 0 && (
            <ul className="space-y-4">
              {displayList.map((friend) => (
                <li key={friend.id} className="flex items-center p-4 rounded-lg border-2 border-[#a8a8a8] justify-between"> {/* Added justify-between */}
                  <div className="flex items-center"> {/* Group image and text */}
                    {friend.profile_img ? <Image
                      src={friend.profile_img || '/plant-happy.png'} // Default image if none
                      alt={friend.name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover border-2 border-[#4A6741] mr-4"
                    /> : 
                      // 프로필 이미지가 없을 때 회색 동그라미
                      <div className="w-[60px] h-[60px] rounded-full bg-gray-300 mr-4"></div>
                    }
                  <div>
                    <p className="font-bold text-lg text-[#023735]">{friend.name}</p>
                    {friend.email && <p className="text-sm text-gray-500">{friend.email}</p>}
                  </div>
                </div>
                  {/* Friend Request Button */}
                  <button
                    onClick={() => handleSendRequest(friend.id)}
                    disabled={sendingRequestId === friend.id}
                    className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors
                      ${sendingRequestId === friend.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4CAF50] hover:bg-[#45a049]'}
                    `}
                  >
                    {sendingRequestId === friend.id ? '요청 중...' : '친구 신청'}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {requestStatus && (
            <div className={`mt-4 p-3 rounded-md text-center text-white
              ${requestStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            `}>
              {requestStatus.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}