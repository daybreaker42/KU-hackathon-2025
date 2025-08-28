"use client";

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [data, setData] = useState<string | null>(null); // 받아온 데이터를 저장할 state
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태를 표시할 state
  const [error, setError] = useState<string | null>(null); // 에러 메시지를 저장할 state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsImlhdCI6MTc1NjM4OTY4OCwiZXhwIjoxNzU2NDc2MDg4fQ.hJ9Ki7FYZsErWkwpubq03cxZbw4v9SUt5nJASqTXccU'; // 여기에 실제 API 토큰을 넣으세요.
        const response = await fetch('https://0350e7e6e842.ngrok-free.app/', {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // Authorization 헤더에 JWT 토큰 추가
            'Content-Type': 'application/json', // Content-Type 설정 (선택 사항)
            'ngrok-skip-browser-warning':'true',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // 응답 상태가 ok가 아니면 에러를 발생
        }
        const result = await response.json(); // 응답을 JSON 형태로 파싱
        setData(result); // 받아온 데이터를 state에 저장
      } catch (e: unknown) { // 에러 타입을 unknown으로 변경
        console.error('Full error details:', e); // 수정: 오류 발생 시 전체 오류 메시지를 콘솔에 출력
        if (e instanceof Error) { // 타입 가드
          setError(e.message); // 에러 메시지를 state에 저장
        } else {
          setError('An unexpected error occurred.'); // 예외 처리
        }
      } finally {
        setLoading(false); // 로딩 상태를 false로 변경
      }
    };

    fetchData(); // fetchData 함수 호출
  }, []); // useEffect는 컴포넌트가 마운트될 때 한 번만 실행

  if (loading) {
    return <div>Loading...</div>; // 로딩 중일 때 "Loading..." 텍스트 표시
  }

  if (error) {
    return <div>Error: {error}</div>; // 에러가 발생했을 때 에러 메시지 표시
  }

  return (
    <div>
      <h1>Data from API:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre> {/* 받아온 데이터를 JSON 형태로 예쁘게 표시 */}
    </div>
  );
}