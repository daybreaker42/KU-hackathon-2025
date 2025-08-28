// app/friends/page.tsx
'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/app/component/common/BackButton';
import { getFriendsList, Friend } from '@/app/api/friendsController';
import Image from 'next/image';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <div className="flex-1 overflow-y-auto p-[18px]">
        <header className="relative flex items-center justify-center mb-4">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">친구 목록</h1>
        </header>

        <main className='bg-transparent bg-none' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          {loading && (
            <div className="text-center text-gray-600">친구 목록을 불러오는 중...</div>
          )}

          {error && (
            <div className="text-center text-red-500">{error}</div>
          )}

          {!loading && !error && friends.length === 0 && (
            <div className="text-center text-gray-600">아직 친구가 없습니다.</div>
          )}

          {!loading && !error && friends.length > 0 && (
            <ul className="space-y-4">
              {friends.map((friend) => (
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