// app/friends/page.tsx
'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/app/component/common/BackButton';
import { getFriendsList, searchUsers, Friend } from '@/app/api/friendsController'; // Import searchUsers
import Image from 'next/image';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
            placeholder="친구 이름 또는 이메일 검색..."
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
                <li key={friend.id} className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                  <Image
                    src={friend.profile_img || '/plant-happy.png'} // Default image if none
                    alt={friend.name}
                    width={60}
                    height={60}
                    className="rounded-full object-cover border-2 border-[#4A6741] mr-4"
                  />
                  <div>
                    <p className="font-bold text-lg text-[#023735]">{friend.name}</p>
                    {friend.email && <p className="text-sm text-gray-500">{friend.email}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}