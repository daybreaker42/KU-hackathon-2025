// Auth 관련 API 통합 관리 컨트롤러

// 환경변수에서 BASE_URL 가져오기 (.env.local에서 관리)
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// 임시 하드코딩된 JWT 토큰 (개발 중 테스트용)
const TEMP_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsImlhdCI6MTc1NjM4OTY4OCwiZXhwIjoxNzU2NDc2MDg4fQ.hJ9Ki7FYZsErWkwpubq03cxZbw4v9SUt5nJASqTXccU';

// 쿠키 유틸리티 함수들
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // httpOnly는 클라이언트에서 설정할 수 없으므로 secure와 SameSite만 설정
    // 실제 httpOnly 설정은 서버에서 처리해야 함
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
  }
};

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

const deleteCookie = (name: string): void => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
  }
};

// 쿠키에서 JWT 토큰 가져오기 (보안 개선: localStorage 대신 쿠키 사용)
export const getAuthToken = (): string | null => {
  return getCookie('authToken');
};

// 쿠키에 JWT 토큰 저장 (보안 개선: localStorage 대신 쿠키 사용)
export const setAuthToken = (token: string): void => {
  // 7일간 유효한 쿠키로 저장
  setCookie('authToken', token, 7);
};

// 쿠키에서 JWT 토큰 제거 (보안 개선: localStorage 대신 쿠키 사용)
export const removeAuthToken = (): void => {
  deleteCookie('authToken');
};

// 기본 헤더 생성 함수 (공통 헤더 설정)
export const createAuthHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // ngrok 브라우저 경고 스킵
  };

  // 인증이 필요한 경우 Authorization 헤더 추가
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// 공통 API 요청 함수
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<Response> => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = createAuthHeaders(requireAuth);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  return response;
};

// 로그인 API 타입 정의
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// 회원가입 API 타입 정의
interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface SignupResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// 로그인 API 함수 (임시 구현 - 하드코딩된 토큰 사용)
export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    // 임시로 서버 요청 없이 하드코딩된 토큰 사용
    console.log('임시 로그인 - 하드코딩된 토큰 사용:', loginData);

    // 실제 서버 요청은 나중에 구현
    // const response = await apiRequest('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify(loginData),
    // }, false);

    // 임시 응답 데이터 생성
    const mockResponse: LoginResponse = {
      token: TEMP_AUTH_TOKEN, // 하드코딩된 토큰 사용
      user: {
        id: 1,
        email: loginData.email,
        name: loginData.email === 'user@example.com' ? '테스트 사용자' : '김민준'
      }
    };

    // 로그인 성공 시 토큰을 보안 쿠키에 저장
    setAuthToken(mockResponse.token);
    
    console.log('임시 로그인 성공:', mockResponse);
    return mockResponse;
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    throw error;
  }
};

// 회원가입 API 함수 (임시 구현 - 하드코딩된 토큰 사용)
export const signup = async (signupData: SignupRequest): Promise<SignupResponse> => {
  try {
    // 임시로 서버 요청 없이 하드코딩된 토큰 사용
    console.log('임시 회원가입 - 하드코딩된 토큰 사용:', signupData);

    // 실제 서버 요청은 나중에 구현
    // const response = await apiRequest('/auth/signup', {
    //   method: 'POST',
    //   body: JSON.stringify(signupData),
    // }, false);

    // 임시 응답 데이터 생성
    const mockResponse: SignupResponse = {
      token: TEMP_AUTH_TOKEN, // 하드코딩된 토큰 사용
      user: {
        id: Math.floor(Math.random() * 1000) + 1, // 임시 랜덤 ID
        email: signupData.email,
        name: signupData.name
      }
    };

    // 회원가입 성공 시 토큰을 보안 쿠키에 저장
    setAuthToken(mockResponse.token);
    
    console.log('임시 회원가입 성공:', mockResponse);
    return mockResponse;
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    throw error;
  }
};

// 로그아웃 API 함수
export const logout = async (): Promise<void> => {
  try {
    // 서버에 로그아웃 요청 (선택사항 - 서버에서 토큰 무효화)
    // await apiRequest('/auth/logout', { method: 'POST' });
    
    // 보안 쿠키에서 토큰 제거 (보안 개선)
    removeAuthToken();
    
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    // 로그아웃은 실패해도 토큰을 제거해야 함
    removeAuthToken();
    throw error;
  }
};

// 개발용 자동 로그인 함수 (하드코딩된 토큰으로 즉시 로그인)
export const autoLogin = (): void => {
  console.log('개발용 자동 로그인 - 하드코딩된 토큰 사용');
  setAuthToken(TEMP_AUTH_TOKEN);
  console.log('자동 로그인 완료');
};

// 인증 상태 확인 함수
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

// 실제 서버 로그인 함수 (나중에 사용할 때를 위해 준비)
export const loginWithServer = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    }, false); // 로그인은 인증 토큰이 필요 없음

    if (!response.ok) {
      throw new Error(`로그인 실패: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    // 로그인 성공 시 토큰을 보안 쿠키에 저장
    setAuthToken(data.token);

    return data;
  } catch (error) {
    console.error('서버 로그인 중 오류 발생:', error);
    throw error;
  }
};

// 실제 서버 회원가입 함수 (나중에 사용할 때를 위해 준비)
export const signupWithServer = async (signupData: SignupRequest): Promise<SignupResponse> => {
  try {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    }, false); // 회원가입은 인증 토큰이 필요 없음

    if (!response.ok) {
      throw new Error(`회원가입 실패: ${response.status}`);
    }

    const data: SignupResponse = await response.json();

    // 회원가입 성공 시 토큰을 보안 쿠키에 저장
    setAuthToken(data.token);

    return data;
  } catch (error) {
    console.error('서버 회원가입 중 오류 발생:', error);
    throw error;
  }
};
