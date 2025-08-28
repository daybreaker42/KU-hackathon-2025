# 🌿 Yeonriji (연리지) - AI Coding Agent Guide

## 프로젝트 개요
식물 기반 커뮤니티 앱. 사용자가 식물을 관리하고, 일기를 작성하며, 커뮤니티에서 소통하는 Next.js 15 + TypeScript 앱입니다.

## 핵심 아키텍처 패턴

### 디렉토리 구조
- `app/` - Next.js 15 App Router 구조
  - `api/` - 클라이언트 API 컨트롤러 (서버 API 호출 함수들)
  - `component/` - 컴포넌트 (재사용 가능)
  - `types/` - TypeScript 타입 정의
- `components/` - 글로벌 컴포넌트 (중복 구조 주의)

### API 통신 패턴
모든 API 호출은 `app/api/` 내 컨트롤러 파일에서 관리:
```typescript
// homeController.tsx 예시 - Bearer 토큰과 ngrok 설정 필수
const header = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'ngrok-skip-browser-warning': 'true'
};
const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
```

### 컴포넌트 패턴
1. **CSS Modules 사용**: `styles.moduleName` 형태로 스타일링
2. **Material Symbols**: Google Material Icons 사용 (`material_symbols_outlined`)
3. **Props 타입 정의**: 모든 컴포넌트에 interface 선언 필수

## 중요 개발 워크플로

### 개발 서버 실행
```bash
npm run dev --turbopack  # Turbopack 사용으로 빠른 개발 서버
```

### 환경 설정
- `NEXT_PUBLIC_API_BASE_URL`: 백엔드 API 베이스 URL (ngrok 등)
- Next.js 15 + React 19 사용 (최신 버전)

## 프로젝트별 컨벤션

### 1. API 응답 처리
모든 API 호출에서 다음 패턴 준수:
```typescript
// Content-Type 검증과 에러 핸들링 필수
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  console.error('Response is not JSON:', contentType);
  return null;
}
```

### 2. 타입 정의 규칙
- 서버 응답용과 클라이언트 표시용 타입 분리
- 예: `DiaryData` (서버) → `SimpleDiaryData` (클라이언트)

### 3. 이미지 처리
`next.config.ts`에서 허용된 도메인만 사용:
- `i.ytimg.com`
- `*.googleapis.com` 
- `via.placeholder.com`

## 핵심 기능별 구현 가이드

### 커뮤니티 (우선순위 높음)
현재 미완성 기능들:
- 댓글 추가/수정/삭제: `app/api/communityController.tsx` 참조
- 대댓글 시스템: `parent_id` 필드 활용
- 좋아요 기능: `POST /community/posts/{id}/like` 엔드포인트 사용

### 일기 시스템
- 날짜별 조회: `getDayDiary(date: Date)` 함수 패턴 따라하기
- 이미지 배열 처리: `images[0]` 첫 번째 이미지만 표시

### 식물 관리
- Plant.id API 연동 예정
- Kakao API 연동 예정

## 주의사항

1. **개발 작업 권한**: 사용자가 명시적으로 요청하지 않는 한 절대 다음 작업을 수행하지 말 것:
   - 개발 서버 실행 (`npm run dev`)
   - 빌드 작업 (`npm run build`)
   - 테스트 실행
   - 패키지 설치/업데이트
   - 환경 설정 변경
2. **하드코딩된 토큰**: `homeController.tsx`의 Bearer 토큰은 개발용 - 실제 인증 구현 필요
3. **중복 컴포넌트**: `app/component/`와 `components/` 디렉토리 정리 필요
4. **임시 데이터**: API 실패 시 fallback 데이터 제공하는 패턴 유지
5. **에러 처리**: 모든 네트워크 요청에 try-catch와 상태별 처리 필수

## 외부 의존성
- **Plant.id API**: 식물 식별 서비스
- **Kakao API**: 소셜 로그인 및 지도 서비스
- **Material Symbols**: UI 아이콘 (CDN 로드됨)

---
API 상세 문서는 `api 정리 문서.txt` 참조
