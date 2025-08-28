/**
 * Auth 관련 API 통합 관리 컨트롤러
 * 
 * 이 파일은 인증 관련 모든 기능을 통합 관리합니다.
 * JWT 토큰 기반 인증, 쿠키 저장, API 요청 헤더 관리 등을 포함합니다.
 * 
 * === 사용법 ===
 * 
 * 1. 개발/테스트용 (하드코딩된 토큰 사용):
 *    ```typescript
 *    import { login, signup, autoLogin } from '@/app/api/authController';
 *    
 *    // 즉시 로그인 (개발용)
 *    autoLogin();
 *    
 *    // Mock 로그인 (UI 테스트용)
 *    const result = await login({ email: 'test@example.com', password: 'password123' });
 *    
 *    // Mock 회원가입 (UI 테스트용)
 *    const result = await signup({ name: '김민준', email: 'test@example.com', password: 'password123' });
 *    ```
 * 
 * 2. 프로덕션용 (실제 서버 연결):
 *    ```typescript
 *    import { loginWithServer, signupWithServer } from '@/app/api/authController';
 *    
 *    // 실제 서버 로그인
 *    const result = await loginWithServer({ email: 'user@example.com', password: 'realpassword' });
 *    
 *    // 실제 서버 회원가입
 *    const result = await signupWithServer({ name: '김민준', email: 'user@example.com', password: 'realpassword' });
 *    ```
 * 
 * 3. 공통 사용:
 *    ```typescript
 *    import { logout, isAuthenticated, getAuthToken } from '@/app/api/authController';
 *    
 *    // 인증 상태 확인
 *    if (isAuthenticated()) {
 *      console.log('로그인됨');
 *    }
 *    
 *    // 로그아웃
 *    await logout();
 *    
 *    // 현재 토큰 가져오기
 *    const token = getAuthToken();
 *    ```
 * 
 * === 개발에서 프로덕션으로 전환하기 ===
 * 
 * 개발 완료 후 실제 서버 연결 시:
 * 1. login → loginWithServer로 교체
 * 2. signup → signupWithServer로 교체
 * 3. autoLogin() 사용 중단
 * 4. TEMP_AUTH_TOKEN 상수 제거
 * 
 */

// 환경변수에서 BASE_URL 가져오기 (.env.local에서 관리)
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * 임시 하드코딩된 JWT 토큰 (개발 중 테스트용)
 * 
 * ⚠️ 주의: 프로덕션에서는 절대 사용하지 마세요!
 * 이 토큰은 개발/테스트 목적으로만 사용되며, 실제 서버 API가 준비되면 제거해야 합니다.
 */
const TEMP_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsImlhdCI6MTc1NjM4OTY4OCwiZXhwIjoxNzU2NDc2MDg4fQ.hJ9Ki7FYZsErWkwpubq03cxZbw4v9SUt5nJASqTXccU';

/**
 * 쿠키 설정 함수
 * 
 * @param name - 쿠키 이름
 * @param value - 쿠키 값
 * @param days - 만료일 (기본값: 7일)
 * 
 * 보안 설정: SameSite=Strict, Secure 속성 포함
 * httpOnly는 클라이언트에서 설정 불가하므로 서버에서 설정 필요
 */
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // httpOnly는 클라이언트에서 설정할 수 없으므로 secure와 SameSite만 설정
    // 실제 httpOnly 설정은 서버에서 처리해야 함
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
  }
};

/**
 * 쿠키 조회 함수
 * 
 * @param name - 조회할 쿠키 이름
 * @returns 쿠키 값 또는 null (쿠키가 없는 경우)
 */
const getCookie = (name: string): string | null => {
  if (typeof window !== 'undefined') {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

/**
 * 쿠키 삭제 함수
 * 
 * @param name - 삭제할 쿠키 이름
 * 
 * 만료일을 과거로 설정하여 쿠키를 삭제합니다.
 */
const deleteCookie = (name: string): void => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
  }
};

/**
 * JWT 토큰 조회 함수
 * 
 * @returns 현재 저장된 JWT 토큰 또는 null
 * 
 * 보안 개선: localStorage 대신 쿠키 사용
 * XSS 공격에 대한 보안성 향상
 */
export const getAuthToken = (): string | null => {
  return getCookie('authToken');
};

/**
 * JWT 토큰 저장 함수
 * 
 * @param token - 저장할 JWT 토큰
 * 
 * 보안 개선: localStorage 대신 쿠키 사용
 * 7일간 유효한 쿠키로 저장, 보안 설정 포함
 */
export const setAuthToken = (token: string): void => {
  // 7일간 유효한 쿠키로 저장
  setCookie('authToken', token, 7);
};

/**
 * 현재 사용자 정보 저장 함수
 * 
 * @param user - 저장할 사용자 정보
 * 
 * 로그인 성공 시 사용자 정보를 localStorage에 저장
 */
export const setCurrentUser = (user: { id: number; email: string; name: string }): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
};

/**
 * 현재 사용자 정보 조회 함수
 * 
 * @returns 저장된 현재 사용자 정보 또는 null
 */
export const getCurrentUser = (): { id: number; email: string; name: string } | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

/**
 * 현재 사용자 정보 제거 함수
 * 
 * 로그아웃 시 사용자 정보를 제거
 */
export const removeCurrentUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }
};

/**
 * JWT 토큰 제거 함수
 * 
 * 로그아웃 시 사용하여 저장된 토큰을 안전하게 제거합니다.
 * 보안 개선: localStorage 대신 쿠키 사용
 */
export const removeAuthToken = (): void => {
  deleteCookie('authToken');
};

/**
 * 인증 헤더 생성 함수
 * 
 * @param includeAuth - 인증 토큰 포함 여부 (기본값: true)
 * @returns HTTP 요청에 사용할 헤더 객체
 * 
 * 모든 API 요청에서 사용하는 공통 헤더를 생성합니다:
 * - Content-Type: application/json
 * - ngrok-skip-browser-warning: ngrok 경고 스킵
 * - Authorization: Bearer {token} (includeAuth가 true인 경우)
 */
export const createAuthHeaders = (includeAuth: boolean = true, isFormData: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true', // ngrok 브라우저 경고 스킵
  };

  // FormData가 아닌 경우에만 Content-Type 설정
  // FormData의 경우 브라우저가 자동으로 multipart/form-data와 boundary를 설정
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // 인증이 필요한 경우 Authorization 헤더 추가
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * 공통 API 요청 함수
 * 
 * @param endpoint - API 엔드포인트 (예: '/auth/login')
 * @param options - fetch 옵션 (method, body 등)
 * @param requireAuth - 인증 토큰 필요 여부 (기본값: true)
 * @returns fetch Response 객체
 * 
 * 모든 API 요청에서 재사용할 수 있는 공통 함수입니다.
 * 자동으로 인증 헤더를 포함하고, 환경변수 기반 BASE_URL을 사용합니다.
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true,
  isFormData: boolean = false
): Promise<Response> => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = createAuthHeaders(requireAuth, isFormData);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  return response;
};

/**
 * === API 타입 정의 ===
 */

/**
 * 로그인 요청 데이터 타입
 */
interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 데이터 타입
 */
interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

/**
 * 회원가입 요청 데이터 타입
 */
interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * 회원가입 응답 데이터 타입
 */
interface SignupResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

/**
 * === 개발/테스트용 함수들 (Mock 구현) ===
 * 
 * ⚠️ 이 함수들은 개발 단계에서만 사용하세요!
 * 실제 서버 API가 준비되면 아래의 "프로덕션용 함수들"을 사용하세요.
 */

/**
 * 개발용 자동 로그인 함수
 * 
 * 하드코딩된 토큰으로 즉시 로그인 상태로 만듭니다.
 * 개발 단계에서 빠른 테스트를 위해 사용합니다.
 * 
 * @example
 * ```typescript
 * autoLogin(); // 즉시 로그인됨
 * console.log(isAuthenticated()); // true
 * ```
 */
export const autoLogin = (): void => {
  console.log('개발용 자동 로그인 - 하드코딩된 토큰 사용');
  setAuthToken(TEMP_AUTH_TOKEN);
  
  // Mock 사용자 정보 저장
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    name: '테스트 사용자'
  };
  setCurrentUser(mockUser);
  
  console.log('자동 로그인 완료');
};

/**
 * Mock 로그인 함수 (개발/테스트용)
//  * 
//  * @param loginData - 로그인 요청 데이터 (이메일, 비밀번호)
//  * @returns 로그인 응답 데이터 (토큰, 사용자 정보)
//  * 
//  * 실제 서버 요청 없이 Mock 데이터로 로그인을 시뮬레이션합니다.
//  * UI 테스트와 개발 단계에서 사용하세요.
//  * 
//  * @example
//  * ```typescript
//  * const result = await login({ 
//  *   email: 'test@example.com', 
//  *   password: 'password123' 
//  * });
//  * console.log(result.user.name); // 사용자 이름 출력
//  * ```
//  */
// export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
//   try {
//     // 임시로 서버 요청 없이 하드코딩된 토큰 사용
//     console.log('임시 로그인 - 하드코딩된 토큰 사용:', loginData);

//     // 실제 서버 요청은 나중에 구현
//     // const response = await apiRequest('/auth/login', {
//     //   method: 'POST',
//     //   body: JSON.stringify(loginData),
//     // }, false);

//     // 임시 응답 데이터 생성
//     const mockResponse: LoginResponse = {
//       token: TEMP_AUTH_TOKEN, // 하드코딩된 토큰 사용
//       user: {
//         id: 1,
//         email: loginData.email,
//         name: loginData.email === 'user@example.com' ? '테스트 사용자' : '김민준'
//       }
//     };

//     // 로그인 성공 시 토큰을 보안 쿠키에 저장
//     setAuthToken(mockResponse.token);
//     // 사용자 정보 저장
//     setCurrentUser(mockResponse.user);
    
//     console.log('임시 로그인 성공:', mockResponse);
//     return mockResponse;
//   } catch (error) {
//     console.error('로그인 중 오류 발생:', error);
//     throw error;
//   }
// };

// /**
//  * Mock 회원가입 함수 (개발/테스트용)
//  * 
//  * @param signupData - 회원가입 요청 데이터 (이름, 이메일, 비밀번호)
//  * @returns 회원가입 응답 데이터 (토큰, 사용자 정보)
//  * 
//  * 실제 서버 요청 없이 Mock 데이터로 회원가입을 시뮬레이션합니다.
//  * UI 테스트와 개발 단계에서 사용하세요.
//  * 
//  * @example
//  * ```typescript
//  * const result = await signup({ 
//  *   name: '김민준',
//  *   email: 'test@example.com', 
//  *   password: 'password123' 
//  * });
//  * console.log(result.user.name); // '김민준'
//  * ```
//  */
// export const signup = async (signupData: SignupRequest): Promise<SignupResponse> => {
//   try {
//     // 임시로 서버 요청 없이 하드코딩된 토큰 사용
//     console.log('임시 회원가입 - 하드코딩된 토큰 사용:', signupData);

//     // 실제 서버 요청은 나중에 구현
//     // const response = await apiRequest('/auth/signup', {
//     //   method: 'POST',
//     //   body: JSON.stringify(signupData),
//     // }, false);

//     // 임시 응답 데이터 생성
//     const mockResponse: SignupResponse = {
//       token: TEMP_AUTH_TOKEN, // 하드코딩된 토큰 사용
//       user: {
//         id: Math.floor(Math.random() * 1000) + 1, // 임시 랜덤 ID
//         email: signupData.email,
//         name: signupData.name
//       }
//     };

//     // 회원가입 성공 시 토큰을 보안 쿠키에 저장
//     setAuthToken(mockResponse.token);
//     // 사용자 정보 저장
//     setCurrentUser(mockResponse.user);
    
//     console.log('임시 회원가입 성공:', mockResponse);
//     return mockResponse;
//   } catch (error) {
//     console.error('회원가입 중 오류 발생:', error);
//     throw error;
//   }
// };

// /**
//  * 로그아웃 함수
//  * 
//  * @returns Promise<void>
//  * 
//  * 저장된 인증 토큰을 제거하고 로그아웃 상태로 만듭니다.
//  * 선택적으로 서버에 로그아웃 요청을 보낼 수 있습니다.
//  * 
//  * @example
//  * ```typescript
//  * try {
//  *   await logout();
//  *   console.log('로그아웃 완료');
//  *   console.log(isAuthenticated()); // false
//  * } catch (error) {
//  *   console.error('로그아웃 오류:', error);
//  * }
//  * ```

export const logout = async (): Promise<void> => {
  try {
    
    // 보안 쿠키에서 토큰 제거 (보안 개선)
    removeAuthToken();
    // 사용자 정보 제거
    removeCurrentUser();
    
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    // 로그아웃은 실패해도 토큰과 사용자 정보를 제거해야 함
    removeAuthToken();
    removeCurrentUser();
    throw error;
  }
};

/**
 * 인증 상태 확인 함수
 * 
 * @returns 현재 로그인되어 있는지 여부 (boolean)
 * 
 * 저장된 토큰의 존재 여부로 인증 상태를 판단합니다.
 * 
 * @example
 * ```typescript
 * if (isAuthenticated()) {
 *   console.log('로그인됨');
 * } else {
 *   console.log('로그아웃됨');
 * }
 * ```
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * === 프로덕션용 함수들 (실제 서버 연결) ===
 * 
 * ✅ 실제 서버 API가 준비되면 이 함수들을 사용하세요!
 * 위의 Mock 함수들 대신 이 함수들로 교체하면 됩니다.
 */

/**
 * 실제 서버 로그인 함수
 * 
 * @param loginData - 로그인 요청 데이터 (이메일, 비밀번호)
 * @returns 서버에서 받은 로그인 응답 데이터
 * 
 * 실제 서버의 /auth/login 엔드포인트에 요청을 보냅니다.
 * 성공 시 받은 토큰을 자동으로 쿠키에 저장합니다.
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await loginWithServer({
 *     email: 'user@example.com',
 *     password: 'realpassword'
 *   });
 *   console.log('실제 로그인 성공:', result.user.name);
 * } catch (error) {
 *   console.error('로그인 실패:', error.message);
 * }
 * ```
 */
export const loginWithServer = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiRequest(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData),
    }, false); // 로그인은 인증 토큰이 필요 없음

    if (!response.ok) {
      throw new Error(`로그인 실패: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    // 로그인 성공 시 토큰을 보안 쿠키에 저장
    setAuthToken(data.token);
    // 사용자 정보 저장
    setCurrentUser(data.user);

    return data;
  } catch (error) {
    console.error('서버 로그인 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 실제 서버 회원가입 함수
 * 
 * @param signupData - 회원가입 요청 데이터 (이름, 이메일, 비밀번호)
 * @returns 서버에서 받은 회원가입 응답 데이터
 * 
 * 실제 서버의 /auth/signup 엔드포인트에 요청을 보냅니다.
 * 성공 시 받은 토큰을 자동으로 쿠키에 저장합니다.
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await signupWithServer({
 *     name: '김민준',
 *     email: 'user@example.com',
 *     password: 'realpassword'
 *   });
 *   console.log('실제 회원가입 성공:', result.user.name);
 * } catch (error) {
 *   console.error('회원가입 실패:', error.message);
 * }
 * ```
 */
export const signupWithServer = async (signupData: SignupRequest): Promise<SignupResponse> => {
  try {
    const response = await apiRequest(`/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(signupData),
    }, false); // 회원가입은 인증 토큰이 필요 없음

    console.log(response);
    if (!response.ok) {
      throw new Error(`회원가입 실패: ${response.status}`);
    }

    const data: SignupResponse = await response.json();

    // 회원가입 성공 시 토큰을 보안 쿠키에 저장
    setAuthToken(data.token);
    // 사용자 정보 저장
    setCurrentUser(data.user);

    return data;
  } catch (error) {
    console.error('서버 회원가입 중 오류 발생:', error);
    throw error;
  }
};

/**
 * === 개발에서 프로덕션으로 전환 가이드 ===
 * 
 * 실제 서버 API가 준비되면 다음과 같이 전환하세요:
 * 
 * 1. import 구문 변경:
 *    ```typescript
 *    // 개발용 (현재)
 *    import { login, signup } from '@/app/api/authController';
 *    
 *    // 프로덕션용 (변경 후)
 *    import { loginWithServer as login, signupWithServer as signup } from '@/app/api/authController';
 *    ```
 * 
 * 2. 또는 함수 이름 직접 변경:
 *    ```typescript
 *    // login() → loginWithServer()
 *    // signup() → signupWithServer()
 *    ```
 * 
 * 3. 코드에서 제거할 것들:
 *    - TEMP_AUTH_TOKEN 상수
 *    - autoLogin() 함수 사용 중단
 *    - Mock 구현된 login(), signup() 함수
 * 
 * 4. 서버에서 추가로 구현해야 할 것들:
 *    - httpOnly 쿠키 설정
 *    - CORS 설정
 *    - 토큰 만료 처리
 *    - Refresh Token 구현 (권장)
 */
