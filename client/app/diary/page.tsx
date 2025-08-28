"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { getDayDiary, SimpleDiaryData } from "../api/homeController";
import Comments from "../component/community/Comments";
import { Comment } from "../types/community/community";

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [diaryData, setDiaryData] = useState<SimpleDiaryData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEmotion, setIsEmotion] = useState<boolean>(false);

  // 터치/드래그 관련 상태
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  // 해당 월의 모든 날짜를 가져오는 함수
  const getDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];

    // 이전 달의 빈 칸들
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // 이전달로 이동
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 다음달로 이동
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 터치 시작 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // 이전 터치 종료 지점 초기화
    setTouchStart(e.targetTouches[0].clientX);
  };

  // 터치 이동 이벤트
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // 터치 종료 이벤트
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // 왼쪽으로 스와이프 -> 다음달
      goToNextMonth();
    }
    if (isRightSwipe) {
      // 오른쪽으로 스와이프 -> 이전달
      goToPreviousMonth();
    }
  };

  // 마우스 드래그 관련 상태
  const [mouseStart, setMouseStart] = useState<number>(0);
  const [mouseEnd, setMouseEnd] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(0);
    setMouseStart(e.clientX);
  };

  // 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  // 마우스 드래그 종료
  const handleMouseUp = () => {
    if (!isDragging || !mouseStart || !mouseEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > 50;
    const isRightDrag = distance < -50;

    if (isLeftDrag) {
      // 왼쪽으로 드래그 -> 다음달
      goToNextMonth();
    }
    if (isRightDrag) {
      // 오른쪽으로 드래그 -> 이전달
      goToPreviousMonth();
    }
    
    setIsDragging(false);
  };

  // 날짜 클릭 핸들러
  const handleDateClick = async (day: number) => {
    if (day) {
      setSelectedDay(day);
      const newSelectedDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(newSelectedDate);
      
      // 해당 날짜의 일기 가져오기
      const diary = await getDayDiary(newSelectedDate);
      setDiaryData(diary);
    }
  };

  // 댓글 관련 함수들
  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: Date.now(),
      content,
      author: "현재 사용자",
      timeAgo: "방금",
      createdAt: new Date().toISOString(),
      parentId: undefined,
    };
    setComments([...comments, newComment]);
  };

  const handleAddReply = (parentId: number, content: string) => {
    const newReply: Comment = {
      id: Date.now(),
      content,
      author: "현재 사용자",
      timeAgo: "방금",
      createdAt: new Date().toISOString(),
      parentId,
    };
    setComments([...comments, newReply]);
  };

  const handleRefresh = () => {
    // 댓글 새로고침 로직
    console.log("댓글 새로고침");
  };

  useEffect(() => {
    // 초기 로딩 시 오늘 날짜의 일기 가져오기
    const today = new Date();
    handleDateClick(today.getDate());
  }, []);

  const days = getDaysInMonth(currentYear, currentMonth);
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>내가 작성한 일기</h1>
        <Link href="/" className={styles.closeButton}>
          <span className="material_symbols_outlined">close</span>
        </Link>
      </div>

      {/* 월 표시 */}
      <div className={styles.monthHeader}>
        <div className={styles.monthNavigation}>
          <button 
            className={styles.monthArrow}
            onClick={goToPreviousMonth}
            aria-label="이전 달"
          >
            <span className="material_symbols_outlined">chevron_left</span>
          </button>
          <h2 className={styles.monthTitle}>{monthNames[currentMonth]}</h2>
          <button 
            className={styles.monthArrow}
            onClick={goToNextMonth}
            aria-label="다음 달"
          >
            <span className="material_symbols_outlined">chevron_right</span>
          </button>
        </div>
        <button className={`${styles.viewModeButton} ${isEmotion ? styles.selected : ''}`} onClick={() => setIsEmotion(!isEmotion)}>감정 보기</button>
      </div>

      {/* 달력 */}
      <div 
        className={styles.calendar}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // 마우스가 달력 영역을 벗어날 때도 드래그 종료
        style={{ userSelect: 'none' }} // 텍스트 선택 방지
      >
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className={styles.emptyDay}></div>;
          }

          const isSelected = day === selectedDay;
          const isToday = 
            day === new Date().getDate() && 
            currentMonth === new Date().getMonth() && 
            currentYear === new Date().getFullYear();
          
          // 임시로 일부 날짜에만 일기가 있다고 표시
          const hasContent = day % 3 === 0 || day % 5 === 0;

          return (
            <div
              key={index}
              className={`${styles.dayItem} ${isSelected ? styles.selected : ''} ${hasContent ? styles.hasContent : ''}`}
              onClick={() => handleDateClick(day)}
            >
              {day}
              {isToday && <div className={styles.todayIndicator}></div>}
            </div>
          );
        })}
      </div>

      {/* 선택된 날짜 */}
      <div className={styles.selectedDateHeader}>
        <h3 className={styles.selectedDate}>{currentMonth + 1}월 {selectedDay}일</h3>
      </div>

      {/* 일기 내용 */}
      <div className={styles.diarySection}>
        {diaryData ? (
          <div className={styles.diaryContent}>
            <h4 className={styles.diaryTitle}>{diaryData.title}</h4>
            {diaryData.photo && (
              <div className={styles.imageContainer}>
                <Image
                  src={diaryData.photo}
                  alt="일기 사진"
                  width={300}
                  height={200}
                  className={styles.diaryImage}
                />
              </div>
            )}
            <p className={styles.diaryText}>{diaryData.content}</p>
            
            {/* 일기 액션 버튼들 */}
            <div className={styles.diaryActions}>
              <button className={styles.actionButton}>세밀 촬영</button>
              <button className={styles.actionButton}>📸</button>
              <button className={styles.actionButton}>급수</button>
            </div>
            <div className={styles.diaryActions}>
              <button className={styles.actionButton}>햇빛 조절</button>
            </div>
          </div>
        ) : (
          <div className={styles.noDiary}>
            <p>제목 제목 제목 제목 제목</p>
            <button className={styles.addDiaryButton}>댓글 작성하기</button>
          </div>
        )}
      </div>

      {/* 댓글 섹션 */}
      <div className={styles.commentsSection}>
        <Comments
          comments={comments}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}