// 쿠키 보안 강화를 위한 서버 설정 가이드
// 
// 현재 클라이언트에서 설정한 쿠키는 기본적인 보안만 적용됩니다.
// 더 강력한 보안을 위해서는 서버에서 다음과 같이 설정해야 합니다:
//
// 1. httpOnly: true - JavaScript로 쿠키에 접근 불가 (XSS 공격 방지)
// 2. secure: true - HTTPS에서만 쿠키 전송
// 3. sameSite: 'strict' - CSRF 공격 방지
// 4. maxAge: 604800 - 7일 (7 * 24 * 60 * 60)
//
// 서버에서 로그인 응답 시 다음과 같이 설정:
// 
// response.cookie('authToken', token, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: 'strict',
//   maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
// });
//
// 이 경우 클라이언트에서는 쿠키를 직접 조작할 수 없고,
// 서버로 요청 시 자동으로 쿠키가 포함됩니다.
//
// 클라이언트에서는 인증 상태만 확인할 수 있고,
// 실제 토큰 값에는 접근할 수 없게 됩니다.

export const SERVER_COOKIE_RECOMMENDATIONS = {
  httpOnly: true,
  secure: true, // HTTPS에서만
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
};
