'use client';

import { useState } from 'react';
import { useLoginController, useSignupController, useAuthGuard } from '@/app/api/loginController';
import styles from './page.module.css';

export default function LoginPage() {
  // 인증 가드 - 로그인되어 있으면 메인 페이지로 리다이렉트
  const { isCheckingAuth } = useAuthGuard('/');
  
  // 상태 관리
  const [isLoginMode, setIsLoginMode] = useState(true); // true: 로그인, false: 회원가입

  // 로그인 컨트롤러
  const {
    email: loginEmail,
    password: loginPassword,
    isLoading: loginLoading,
    error: loginError,
    setEmail: setLoginEmail,
    setPassword: setLoginPassword,
    handleLogin,
    resetForm: resetLoginForm
  } = useLoginController();

  // 회원가입 컨트롤러
  const {
    name,
    email: signupEmail,
    password: signupPassword,
    confirmPassword,
    isLoading: signupLoading,
    error: signupError,
    setName,
    setEmail: setSignupEmail,
    setPassword: setSignupPassword,
    setConfirmPassword,
    handleSignup,
    resetForm: resetSignupForm
  } = useSignupController();

  // 모드 전환 함수
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    resetLoginForm();
    resetSignupForm();
  };

  // 인증 상태 확인 중이면 로딩 화면 표시
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
        <div className={styles.container}>
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-[#023735] rounded-full mx-auto mb-4"></div>
              <p className="text-[#023735]">인증 상태 확인 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
      <div className={styles.container}>
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#023735] mb-2">
            {isLoginMode ? '로그인' : '회원가입'}
          </h1>
        </div>

        {/* 폼 */}
        <form onSubmit={isLoginMode ? handleLogin : handleSignup}>
          {/* 회원가입일 때만 이름 필드 표시 */}
          {!isLoginMode && (
            <div className={styles.inputContainer}>
              <label htmlFor="name" className={styles.label}>
                이름
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="이름 입력"
                required
              />
            </div>
          )}

          {/* 이메일 필드 */}
          <div className={styles.inputContainer}>
            <label htmlFor="email" className={styles.label}>
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={isLoginMode ? loginEmail : signupEmail}
              onChange={(e) => isLoginMode ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)}
              className={styles.input}
              placeholder="user@example.com"
              required
            />
          </div>

          {/* 비밀번호 필드 */}
          <div className={styles.inputContainer}>
            <label htmlFor="password" className={styles.label}>
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={isLoginMode ? loginPassword : signupPassword}
              onChange={(e) => isLoginMode ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
              className={styles.input}
              placeholder="password123"
              required
            />
          </div>

          {/* 회원가입일 때만 비밀번호 확인 필드 표시 */}
          {!isLoginMode && (
            <div className={styles.inputContainer}>
              <label htmlFor="confirmPassword" className={styles.label}>
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="비밀번호 재입력"
                required
              />
            </div>
          )}

          {/* 에러 메시지 - input 아래에 표시 */}
          {(loginError || signupError) && (
            <div className={styles.errorMessage}>
              {isLoginMode ? loginError : signupError}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoginMode ? loginLoading : signupLoading}
            className={styles.submitButton}
          >
            {(isLoginMode ? loginLoading : signupLoading) ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 모드 전환 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-[#023735] hover:text-[#034a47] text-sm"
          >
            {isLoginMode ? '계정이 없으신가요? 회원가입하기' : '이미 계정이 있으신가요? 로그인하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
