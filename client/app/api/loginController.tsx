import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  loginWithServer, 
  signupWithServer,
  isAuthenticated 
} from './authController';

// LoginResponse 타입 import
import type { LoginResponse } from './authController';

// authController에서 타입들 가져오기
interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: '비밀번호는 6자 이상이어야 합니다.' };
  }
  
  return { isValid: true };
};

/**
 * 로그인 컨트롤러 훅
 * 
 * @param onSuccess - 로그인 성공 시 실행할 콜백 함수 (선택사항)
 * @param redirectPath - 로그인 성공 시 리다이렉트할 경로 (기본값: '/')
 */
export const useLoginController = (
  onSuccess?: () => void,
  redirectPath: string = '/'
) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 로그인 처리 함수
   */
  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // 이미 로그인되어 있는지 확인
    if (isAuthenticated()) {
      console.log('이미 로그인되어 있음, 리다이렉트');
      router.push(redirectPath);
      return;
    }

    // 기본 유효성 검사
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 개발/프로덕션 모드에 따라 다른 함수 사용
      const loginFunction = loginWithServer;


      // console.log('로그인 성공:', result);

      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess();
      }

      // 페이지 리다이렉트
      router.push(redirectPath);

    } catch (error: any) {
      console.error('로그인 실패:', error);
      
      // 에러 메시지 설정
      if (error.message) {
        setError(error.message);
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router, onSuccess, redirectPath]);

  /**
   * 폼 초기화 함수
   */
  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setError(null);
  }, []);

  return {
    // 상태
    email,
    password,
    isLoading,
    error,
    
    // 상태 변경 함수
    setEmail,
    setPassword,
    
    // 액션 함수
    handleLogin,
    resetForm,
    
    // 유틸리티
    isFormValid: email.trim() && password.trim() && validateEmail(email)
  };
};

/**
 * 회원가입 컨트롤러 훅
 * 
 * @param onSuccess - 회원가입 성공 시 실행할 콜백 함수 (선택사항)
 * @param redirectPath - 회원가입 성공 시 리다이렉트할 경로 (기본값: '/')
 */
export const useSignupController = (
  onSuccess?: () => void,
  redirectPath: string = '/'
) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 회원가입 처리 함수
   */
  const handleSignup = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // 이미 로그인되어 있는지 확인
    if (isAuthenticated()) {
      console.log('이미 로그인되어 있음, 리다이렉트');
      router.push(redirectPath);
      return;
    }

    // 기본 유효성 검사
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (name.trim().length < 2) {
      setError('이름은 2자 이상이어야 합니다.');
      return;
    }

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || '비밀번호가 유효하지 않습니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signupFunction = signupWithServer;
      
      const result = await signupFunction({
        name: name.trim(),
        email: email.trim(),
        password: password
      });

      // console.log('회원가입 성공:', result);

      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess();
      }

      // 페이지 리다이렉트
      router.push(redirectPath);

    } catch (error: any) {
      console.error('회원가입 실패:', error);
      
      // 에러 메시지 설정
      if (error.message) {
        setError(error.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, confirmPassword, router, onSuccess, redirectPath]);

  /**
   * 폼 초기화 함수
   */
  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  }, []);

  return {
    // 상태
    name,
    email,
    password,
    confirmPassword,
    isLoading,
    error,
    
    // 상태 변경 함수
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    
    // 액션 함수
    handleSignup,
    resetForm,
    
    // 유틸리티
    isFormValid: 
      name.trim().length >= 2 && 
      email.trim() && 
      validateEmail(email) && 
      password.trim() && 
      validatePassword(password).isValid &&
      password === confirmPassword
  };
};


export const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 초기값을 함수로 설정하여 마운트 시 인증 상태 확인
    return isAuthenticated();
  });

  return {
    isLoggedIn,
    checkAuthStatus: () => {
      const status = isAuthenticated();
      setIsLoggedIn(status);
      return status;
    }
  };
};

export const useAuthGuard = (redirectPath: string = '/') => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        router.push(redirectPath);
        return;
      }
      setIsCheckingAuth(false);
    };

    // 약간의 지연을 두고 확인 (클라이언트 사이드 렌더링 고려)
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [router, redirectPath]);

  return { isCheckingAuth };
};

// 타입 내보내기 (다른 컴포넌트에서 사용할 수 있도록)
export type { 
  LoginRequest, 
  SignupRequest 
};
