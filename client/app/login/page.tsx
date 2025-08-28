'use client';

import { useState } from 'react';
import { login, signup, logout, isAuthenticated } from '@/app/api/authController';

export default function LoginPage() {
  // 상태 관리
  const [isLoginMode, setIsLoginMode] = useState(true); // true: 로그인, false: 회원가입
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await login({ email, password });
      setSuccess(`로그인 성공! 환영합니다, ${result.user.name}님`);
      console.log('로그인 결과:', result);
      
      // 폼 초기화
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signup({ name, email, password });
      setSuccess(`회원가입 성공! 환영합니다, ${result.user.name}님`);
      console.log('회원가입 결과:', result);
      
      // 폼 초기화
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      setSuccess('로그아웃되었습니다.');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : '로그아웃에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#023735] mb-2">
            {isLoginMode ? '로그인' : '회원가입'}
          </h1>
          <p className="text-gray-600">
            식물 관리 커뮤니티에 {isLoginMode ? '로그인' : '가입'}하세요
          </p>
        </div>

        {/* 현재 인증 상태 표시 */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm">
            <strong>인증 상태:</strong> {isAuthenticated() ? '✅ 로그인됨' : '❌ 로그아웃됨'}
          </div>
          {isAuthenticated() && (
            <button
              onClick={handleLogout}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              로그아웃하기
            </button>
          )}
        </div>

        {/* 성공/오류 메시지 */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={isLoginMode ? handleLogin : handleSignup}>
          {/* 회원가입일 때만 이름 필드 표시 */}
          {!isLoginMode && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#023735]"
                placeholder="김민준"
                required
              />
            </div>
          )}

          {/* 이메일 필드 */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#023735]"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* 비밀번호 필드 */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#023735]"
              placeholder="password123"
              required
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#023735] text-white py-2 px-4 rounded-md hover:bg-[#034a47] focus:outline-none focus:ring-2 focus:ring-[#023735] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 모드 전환 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null);
              setSuccess(null);
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-[#023735] hover:text-[#034a47] text-sm"
          >
            {isLoginMode ? '계정이 없으신가요? 회원가입하기' : '이미 계정이 있으신가요? 로그인하기'}
          </button>
        </div>

        {/* 테스트용 빠른 로그인 버튼 */}
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700 mb-2">💡 개발 테스트용 빠른 로그인:</p>
          <button
            onClick={() => {
              setEmail('user@example.com');
              setPassword('password123');
            }}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            테스트 계정 정보 자동 입력
          </button>
        </div>
      </div>
    </div>
  );
}
