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

  // Tab State - 검색 탭 제거
  const [selectedTab, setSelectedTab] = useState<'friends' | 'received' | 'sent'>('friends');

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
      return;
    }

    // 검색어가 있으면 검색 실행
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

  const renderFriendItem = (friend: Friend) => {
    // 친구 요청 버튼 상태 결정 로직
    const isAlreadyFriend = friend.isFriend;
    const hasPendingRequest = friend.hasPendingRequest;
    const isButtonDisabled = sendingRequestId === friend.id || isAlreadyFriend || hasPendingRequest;

    // 버튼 텍스트 결정
    const getButtonText = () => {
      if (sendingRequestId === friend.id) return '요청 중...';
      if (isAlreadyFriend) return '이미 친구';
      if (hasPendingRequest) return '요청 전송됨';
      return '친구 신청';
    };

    // 버튼 스타일 결정
    const getButtonClassName = () => {
      if (isAlreadyFriend) {
        return 'bg-blue-500 cursor-not-allowed'; // 이미 친구인 경우 파란색
      }
      if (hasPendingRequest) {
        return 'bg-orange-500 cursor-not-allowed'; // 요청 대기 중인 경우 주황색
      }
      if (sendingRequestId === friend.id) {
        return 'bg-gray-400 cursor-not-allowed'; // 요청 처리 중인 경우 회색
      }
      return 'bg-[#4CAF50] hover:bg-[#45a049]'; // 기본 상태 초록색
    };

    return (
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
        {searchQuery.trim() !== '' && (
          <button
            onClick={() => handleSendRequest(friend.id)}
            disabled={isButtonDisabled}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${getButtonClassName()}`}
          >
            {getButtonText()}
          </button>
        )}
      </li>
    );
  };

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
        <div className="flex justify-around mb-4 p-2 rounded-lg">
          <button
            onClick={() => setSelectedTab('friends')}
            className={`flex-1 py-2 text-center font-bold rounded-md transition-colors mx-1
              ${selectedTab === 'friends' ? 'bg-[#4CAF50] text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            내 친구
            {friends.length > 0 && (
              <span className="ml-1 text-xs bg-white bg-opacity-20 px-1 rounded-full">
                {friends.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('received')}
            className={`flex-1 py-2 text-center font-bold rounded-md transition-colors mx-1
              ${selectedTab === 'received' ? 'bg-[#4CAF50] text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            받은 요청
            {receivedRequests.length > 0 && (
              <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded-full">
                {receivedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('sent')}
            className={`flex-1 py-2 text-center font-bold rounded-md transition-colors mx-1
              ${selectedTab === 'sent' ? 'bg-[#4CAF50] text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            보낸 요청
            {sentRequests.length > 0 && (
              <span className="ml-1 text-xs bg-yellow-500 text-white px-1 rounded-full">
                {sentRequests.length}
              </span>
            )}
          </button>
        </div>

        <main className='bg-transparent bg-none' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          {/* Global Action Status Message - 더 눈에 띄는 토스트 메시지 */}
          {actionStatus && (
            <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg text-center text-white shadow-lg max-w-sm
              ${actionStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            `}>
              <div className="flex items-center justify-center">
                <span className="mr-2">
                  {actionStatus.type === 'success' ? '✅' : '❌'}
                </span>
                <span className="font-medium">{actionStatus.message}</span>
              </div>
            </div>
          )}

          {/* Conditional Content Rendering */}
          
          {/* 검색어가 있을 때 - 검색 결과 표시 */}
          {searchQuery.trim() !== '' && (
            <>
              {searchLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mb-4"></div>
                  <p className="text-gray-600 font-medium">사용자를 검색하는 중입니다...</p>
                  <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
                </div>
              )}
              {searchError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-red-600 font-semibold mb-2">검색 중 오류가 발생했습니다</p>
                  <p className="text-red-500 text-sm text-center mb-4">{searchError}</p>
                  <button
                    onClick={() => {
                      setSearchError(null);
                      if (searchQuery.trim()) {
                        // 검색 재시도 로직은 useEffect가 처리
                        setSearchQuery(searchQuery + ' '); // 임시로 변경하여 useEffect 트리거
                        setTimeout(() => setSearchQuery(searchQuery), 100);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {!searchLoading && !searchError && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <p className="text-gray-600 font-medium mb-2">검색 결과가 없습니다</p>
                  <p className="text-sm text-gray-500 text-center">
                    &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo;와 일치하는 사용자를 찾을 수 없습니다
                  </p>
                  <p className="text-xs text-gray-400 mt-2">다른 검색어를 시도해보세요</p>
                </div>
              )}
              {!searchLoading && !searchError && searchResults.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    총 <span className="font-semibold text-[#4CAF50]">{searchResults.length}명</span>의 사용자를 찾았습니다
                  </p>
                  <ul className="space-y-4">
                    {searchResults.map((friend) => renderFriendItem(friend))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* 검색어가 없을 때 - 탭별 내용 표시 */}
          {searchQuery.trim() === '' && selectedTab === 'friends' && (
            <>
              {friendsLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mb-4"></div>
                  <p className="text-gray-600 font-medium">친구 목록을 불러오는 중입니다...</p>
                  <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
                </div>
              )}
              {friendsError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-red-600 font-semibold mb-2">친구 목록을 불러올 수 없습니다</p>
                  <p className="text-red-500 text-sm text-center mb-4">{friendsError}</p>
                  <button 
                    onClick={() => {
                      setFriendsError(null);
                      // fetchFriends 함수가 없으므로 페이지 새로고침으로 대체
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {!friendsLoading && !friendsError && friends.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-gray-300 text-5xl mb-4">🤝</div>
                  <p className="text-gray-600 font-medium mb-2">아직 친구가 없습니다</p>
                  <p className="text-sm text-gray-500 text-center max-w-xs">
                    위 검색창에서 새로운 친구를 찾아<br/>
                    친구 신청을 보내보세요!
                  </p>
                </div>
              )}
              {!friendsLoading && !friendsError && friends.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    총 <span className="font-semibold text-[#4CAF50]">{friends.length}명</span>의 친구가 있습니다
                  </p>
                  <ul className="space-y-4">
                    {friends.map((friend) => renderFriendItem(friend))}
                  </ul>
                </div>
              )}
            </>
          )}

          {searchQuery.trim() === '' && selectedTab === 'received' && (
            <>
              {requestsLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mb-4"></div>
                  <p className="text-gray-600 font-medium">받은 친구 요청을 불러오는 중입니다...</p>
                  <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
                </div>
              )}
              {requestsError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-red-600 font-semibold mb-2">친구 요청을 불러올 수 없습니다</p>
                  <p className="text-red-500 text-sm text-center mb-4">{requestsError}</p>
                  <button 
                    onClick={() => {
                      setRequestsError(null);
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {!requestsLoading && !requestsError && receivedRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-gray-300 text-5xl mb-4">📨</div>
                  <p className="text-gray-600 font-medium mb-2">받은 친구 요청이 없습니다</p>
                  <p className="text-sm text-gray-500 text-center max-w-xs">
                    다른 사용자로부터 친구 요청이 오면<br/>
                    여기에서 확인할 수 있습니다
                  </p>
                </div>
              )}
              {!requestsLoading && !requestsError && receivedRequests.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    <span className="font-semibold text-[#4CAF50]">{receivedRequests.length}개</span>의 친구 요청을 받았습니다
                  </p>
                  <ul className="space-y-4">
                    {receivedRequests.map((req) => renderRequestItem(req, 'received'))}
                  </ul>
                </div>
              )}
            </>
          )}

          {searchQuery.trim() === '' && selectedTab === 'sent' && (
            <>
              {requestsLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mb-4"></div>
                  <p className="text-gray-600 font-medium">보낸 친구 요청을 불러오는 중입니다...</p>
                  <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
                </div>
              )}
              {requestsError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-red-600 font-semibold mb-2">친구 요청을 불러올 수 없습니다</p>
                  <p className="text-red-500 text-sm text-center mb-4">{requestsError}</p>
                  <button 
                    onClick={() => {
                      setRequestsError(null);
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {!requestsLoading && !requestsError && sentRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-gray-300 text-5xl mb-4">📤</div>
                  <p className="text-gray-600 font-medium mb-2">보낸 친구 요청이 없습니다</p>
                  <p className="text-sm text-gray-500 text-center max-w-xs">
                    위 검색창에서 다른 사용자를 찾아<br/>
                    친구 신청을 보내보세요!
                  </p>
                </div>
              )}
              {!requestsLoading && !requestsError && sentRequests.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    <span className="font-semibold text-[#4CAF50]">{sentRequests.length}개</span>의 친구 요청을 보냈습니다
                  </p>
                  <ul className="space-y-4">
                    {sentRequests.map((req) => renderRequestItem(req, 'sent'))}
                  </ul>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}