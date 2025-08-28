'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/app/component/common/BackButton';
import { getFriendsList, searchUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, Friend, FriendRequest } from '@/app/api/friendsController';
import Image from 'next/image';

export default function FriendsPage() {
  // Main Friend List States
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Friend Request List States
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Action States (Send Request, Accept, Reject, Cancel)
  const [sendingRequestId, setSendingRequestId] = useState<number | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [actionStatus, setActionStatus] = useState<{ id?: number; message: string; type: 'success' | 'error' } | null>(null);

  // Tab State
  const [selectedTab, setSelectedTab] = useState<'friends' | 'received' | 'sent' | 'search'>('friends');

  // --- Data Fetching Effects ---

  // Fetch friends function
  const fetchFriends = async () => {
    setFriendsLoading(true);
    setFriendsError(null);
    try {
      const data = await getFriendsList();
      setFriends(data);
    } catch (err: any) {
      setFriendsError(err.message || '친구 목록을 불러오는데 실패했습니다.');
    } finally {
      setFriendsLoading(false);
    }
  };

  // Fetch initial friends list
  useEffect(() => {
    fetchFriends();
  }, []);

  // Fetch friend requests
  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await getFriendRequests();
      setReceivedRequests(data.received);
      setSentRequests(data.sent);
    } catch (err: any) {
      setRequestsError(err.message || '친구 요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle search query changes with debounce
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setSearchError(null);
      setSelectedTab('friends'); // Go back to friends list if search is cleared
      return;
    }

    setSelectedTab('search'); // Switch to search tab when query is active
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

  // --- Action Handlers ---

  const handleSendRequest = async (friendId: number) => {
    setSendingRequestId(friendId);
    setActionStatus(null);

    try {
      const response = await sendFriendRequest(friendId);
      setActionStatus({ id: friendId, message: response.message, type: 'success' });
      // Optionally, refresh the list or update friend status in state
    } catch (err: any) {
      setActionStatus({ id: friendId, message: err.message || '친구 요청 실패', type: 'error' });
    } finally {
      setSendingRequestId(null);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject' | 'cancel') => {
    setProcessingRequestId(requestId);
    setActionStatus(null);
    try {
      let response;
      if (action === 'accept') {
        response = await acceptFriendRequest(requestId);
      } else if (action === 'reject') {
        response = await rejectFriendRequest(requestId);
      } else {
        response = await cancelFriendRequest(requestId);
      }
      setActionStatus({ id: requestId, message: response.message, type: 'success' });
      fetchRequests(); // Refresh the list after action
      fetchFriends(); // Also refresh friends list in case of accept
    } catch (err: any) {
      setActionStatus({ id: requestId, message: err.message || `${action} 실패`, type: 'error' });
    } finally {
      setProcessingRequestId(null);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  // --- Render Helpers ---

  const renderFriendItem = (friend: Friend) => (
    <li key={friend.id} className="flex items-center p-4 rounded-lg border-2 border-[#a8a8a8] justify-between">
      <div className="flex items-center">
        {friend.profile_img ? (
          <Image
            src={friend.profile_img}
            alt={friend.name}
            width={60}
            height={60}
            className="rounded-full object-cover border-2 border-[#4A6741] mr-4"
          />
        ) : (
          <div className="w-[60px] h-[60px] rounded-full bg-gray-300 mr-4"></div>
        )}
        <div>
          <p className="font-bold text-lg text-[#023735]">{friend.name}</p>
          {friend.email && <p className="text-sm text-gray-500">{friend.email}</p>}
        </div>
      </div>
      {selectedTab === 'search' && (
        <button
          onClick={() => handleSendRequest(friend.id)}
          disabled={sendingRequestId === friend.id}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors
            ${sendingRequestId === friend.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4CAF50] hover:bg-[#45a049]'}
          `}
        >
          {sendingRequestId === friend.id ? '요청 중...' : '친구 신청'}
        </button>
      )}
    </li>
  );

  const renderRequestItem = (request: FriendRequest, type: 'received' | 'sent') => {
    const user = type === 'received' ? request.requester : request.recipient;
    const isProcessing = processingRequestId === request.id;

    return (
      <li key={request.id} className="flex items-center p-4  rounded-lg justify-between">
        <div className="flex items-center">
          {user.profile_img ? (
            <Image
              src={user.profile_img}
              alt={user.name}
              width={60}
              height={60}
              className="rounded-full object-cover border-2 border-[#4A6741] mr-4"
            />
          ) : (
            <div className="w-[60px] h-[60px] rounded-full bg-gray-300 mr-4"></div>
          )}
          <div>
            <p className="font-bold text-lg text-[#023735]">{user.name}</p>
            <p className="text-sm text-gray-500">{request.status} - {new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {type === 'received' ? (
            <>
              <button
                onClick={() => handleRequestAction(request.id, 'accept')}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors
                  ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4CAF50] hover:bg-[#45a049]'}
                `}
              >
                {isProcessing ? '처리 중...' : '수락'}
              </button>
              <button
                onClick={() => handleRequestAction(request.id, 'reject')}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors
                  ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}
                `}
              >
                {isProcessing ? '처리 중...' : '거절'}
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRequestAction(request.id, 'cancel')}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}
              `}
            >
              {isProcessing ? '처리 중...' : '취소'}
            </button>
          )}
        </div>
      </li>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <div className="flex-1 overflow-y-auto p-[18px]">
        <header className="relative flex items-center justify-center mb-4">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">친구 관리</h1>
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

        {/* Tabs */}
        <div className="flex justify-around mb-4  p-2 rounded-lg">
          <button
            onClick={() => setSelectedTab('friends')}
            className={`flex-1 py-2 text-center font-bold rounded-md transition-colors
              ${selectedTab === 'friends' ? 'bg-[#4CAF50] text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            내 친구
          </button>
          <button
            onClick={() => setSelectedTab('received')}
            className={`flex-1 py-2 text-center font-bold rounded-md transition-colors
              ${selectedTab === 'received' ? 'bg-[#4CAF50] text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            받은 요청
          </button>
          <button
            onClick={() => setSelectedTab('sent')}
            className={`flex-1 py-2 text-center font-bold rounded-md transition-colors
              ${selectedTab === 'sent' ? 'bg-[#4CAF50] text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            보낸 요청
          </button>
        </div>

        <main className='bg-transparent bg-none' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          {/* Global Action Status Message */}
          {actionStatus && (
            <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-3 rounded-md text-center text-white
              ${actionStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            `}>
              {actionStatus.message}
            </div>
          )}

          {/* Conditional Content Rendering */}
          {selectedTab === 'search' && (
            <>
              {searchLoading && (
                <div className="text-center text-gray-600">사용자 검색 중...</div>
              )}
              {searchError && (
                <div className="text-center text-red-500">{searchError}</div>
              )}
              {!searchLoading && !searchError && searchResults.length === 0 && (
                <div className="text-center text-gray-600">검색 결과가 없습니다.</div>
              )}
              {!searchLoading && !searchError && searchResults.length > 0 && (
                <ul className="space-y-4">
                  {searchResults.map((friend) => renderFriendItem(friend))}
                </ul>
              )}
            </>
          )}

          {selectedTab === 'friends' && searchQuery.trim() === '' && (
            <>
              {friendsLoading && (
                <div className="text-center text-gray-600">친구 목록을 불러오는 중...</div>
              )}
              {friendsError && (
                <div className="text-center text-red-500">{friendsError}</div>
              )}
              {!friendsLoading && !friendsError && friends.length === 0 && (
                <div className="text-center text-gray-600">아직 친구가 없습니다.</div>
              )}
              {!friendsLoading && !friendsError && friends.length > 0 && (
                <ul className="space-y-4">
                  {friends.map((friend) => renderFriendItem(friend))}
                </ul>
              )}
            </>
          )}

          {selectedTab === 'received' && searchQuery.trim() === '' && (
            <>
              {requestsLoading && (
                <div className="text-center text-gray-600">받은 친구 요청 목록을 불러오는 중...</div>
              )}
              {requestsError && (
                <div className="text-center text-red-500">{requestsError}</div>
              )}
              {!requestsLoading && !requestsError && receivedRequests.length === 0 ? (
                <p className="text-gray-600">받은 친구 요청이 없습니다.</p>
              ) : (
                <ul className="space-y-4">
                  {receivedRequests.map((req) => renderRequestItem(req, 'received'))}
                </ul>
              )}
            </>
          )}

          {selectedTab === 'sent' && searchQuery.trim() === '' && (
            <>
              {requestsLoading && (
                <div className="text-center text-gray-600">보낸 친구 요청 목록을 불러오는 중...</div>
              )}
              {requestsError && (
                <div className="text-center text-red-500">{requestsError}</div>
              )}
              {!requestsLoading && !requestsError && sentRequests.length === 0 ? (
                <p className="text-gray-600">보낸 친구 요청이 없습니다.</p>
              ) : (
                <ul className="space-y-4">
                  {sentRequests.map((req) => renderRequestItem(req, 'sent'))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}