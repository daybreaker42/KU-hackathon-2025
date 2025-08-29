"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { getDayDiary, SimpleDiaryData, getMonthlyDiary, MonthlyDiaryData } from "../api/homeController";
import Comments from "../component/community/Comments";
import { Comment } from "../types/community/community";
import { deleteDiary, getDiaryComments, createDiaryComment, updateDiaryComment, deleteDiaryComment, DiaryComment, CreateDiaryCommentData, UpdateDiaryCommentData } from "../api/diaryController";
import { getCurrentUser } from "../api/authController";

// 로컬 Comment 타입 (authorId 포함)
interface LocalComment extends Comment {
  authorId: number;
}

// API Comment를 로컬 Comment로 변환하는 함수
const convertAPICommentToLocal = (apiComment: DiaryComment): LocalComment => {
  // timeAgo 계산
  const now = new Date();
  const createdAt = new Date(apiComment.createdAt);
  const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

  let timeAgo: string;
  if (diffInMinutes < 1) {
    timeAgo = "방금 전";
  } else if (diffInMinutes < 60) {
    timeAgo = `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    timeAgo = `${hours}시간 전`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    timeAgo = `${days}일 전`;
  }

  return {
    id: apiComment.id,
    author: apiComment.author.name,
    authorId: apiComment.author.id,
    content: apiComment.content,
    timeAgo,
    createdAt: apiComment.createdAt,
    parentId: apiComment.parent_id || undefined
  };
};

// API 댓글 데이터를 로컬 형식으로 변환하는 함수
const convertAPICommentsToLocal = (apiComments: DiaryComment[]): LocalComment[] => {
  const result: LocalComment[] = [];

  // 부모 댓글과 대댓글을 모두 평탄화
  apiComments.forEach(comment => {
    // 부모 댓글 추가
    result.push(convertAPICommentToLocal(comment));

    // 대댓글 추가
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach(reply => {
        result.push(convertAPICommentToLocal(reply));
      });
    }
  });

  return result;
};

// 감정 라벨을 이모티콘으로 변환하는 함수
const getEmotionEmoji = (emotionLabel: string): string => {
  const emotionMap: { [key: string]: string } = {
    '기쁨': '😊',
    '슬픔': '😢',
    '화남': '😡',
    '걱정': '😰',
    '짜증': '😤',
    '피곤': '😪'
  };
  
  return emotionMap[emotionLabel] || emotionLabel;
};

function DiaryPageContent() {
  const searchParams = useSearchParams();
  
  // URL 파라미터에서 날짜 가져오기
  const getInitialDateFromParams = () => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        return {
          selectedDate: date,
          selectedDay: date.getDate(),
          currentMonth: date.getMonth(),
          currentYear: date.getFullYear()
        };
      }
    }
    // 기본값은 오늘 날짜
    const today = new Date();
    return {
      selectedDate: today,
      selectedDay: today.getDate(),
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear()
    };
  };

  const initialDate = getInitialDateFromParams();
  
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate.selectedDate);
  const [selectedDay, setSelectedDay] = useState<number>(initialDate.selectedDay);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.currentMonth);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.currentYear);
  const [diaryData, setDiaryData] = useState<SimpleDiaryData | null>(null);
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [isEmotion, setIsEmotion] = useState<boolean>(false);
  const [monthlyDiary, setMonthlyDiary] = useState<MonthlyDiaryData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; name: string } | null>(null);

  // 터치/드래그 관련 상태
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  // 해당 월의 모든 날짜를 가져오는 함수
  const getDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days: (number | null)[] = [];

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
    setMonthlyDiary(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 다음달로 이동
  const goToNextMonth = () => {
    setMonthlyDiary(null);
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
      
      // 일기가 있으면 댓글도 가져오기
      if (diary) {
        try {
          const diaryComments = await getDiaryComments(diary.id);
          const localComments = convertAPICommentsToLocal(diaryComments);
          setComments(localComments);
        } catch (error) {
          console.error('댓글 로딩 실패:', error);
          setComments([]);
        }
      } else {
        setComments([]);
      }
    }
  };

  // 댓글 관련 함수들
  const handleAddComment = async (content: string) => {
    if (!currentUser || !diaryData) {
      console.error('사용자 정보나 일기 정보가 없습니다.');
      return;
    }

    try {
      // API 호출
      const commentData: CreateDiaryCommentData = { content };
      const newComment = await createDiaryComment(diaryData.id, commentData);

      // 로컬 상태 업데이트
      const localComment = convertAPICommentToLocal(newComment);
      setComments(prevComments => [...prevComments, localComment]);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      // API 실패 시 로컬에서 처리
      const comment: LocalComment = {
        id: Date.now(),
        author: currentUser.name,
        authorId: currentUser.id,
        content,
        timeAgo: "방금 전",
        createdAt: new Date().toISOString(),
        parentId: undefined,
      };
      setComments(prevComments => [...prevComments, comment]);
    }
  };

  const handleAddReply = async (parentId: number, content: string) => {
    if (!currentUser || !diaryData) {
      console.error('사용자 정보나 일기 정보가 없습니다.');
      return;
    }

    try {
      // API 호출
      const commentData: CreateDiaryCommentData = { content, parent_id: parentId };
      const newReply = await createDiaryComment(diaryData.id, commentData);

      // 로컬 상태 업데이트
      const localReply = convertAPICommentToLocal(newReply);
      setComments(prevComments => [...prevComments, localReply]);
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
      // API 실패 시 로컬에서 처리
      const reply: LocalComment = {
        id: Date.now(),
        author: currentUser.name,
        authorId: currentUser.id,
        content,
        timeAgo: "방금 전",
        createdAt: new Date().toISOString(),
        parentId,
      };
      setComments(prevComments => [...prevComments, reply]);
    }
  };

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    // URL 파라미터에서 지정된 날짜 또는 오늘 날짜의 일기 가져오기
    handleDateClick(initialDate.selectedDay);
  }, []);

  // URL 파라미터가 변경될 때 날짜 업데이트
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setSelectedDay(date.getDate());
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
        handleDateClick(date.getDate());
      }
    }
  }, [searchParams]);

  // 월별 일기 데이터 로드
  useEffect(() => {
    const loadMonthlyDiary = async () => {
      const data = await getMonthlyDiary(currentYear, currentMonth + 1); // API는 1-12월을 사용
      setMonthlyDiary(data);
    };
    
    loadMonthlyDiary();
  }, [currentYear, currentMonth]);

  const days = getDaysInMonth(currentYear, currentMonth);
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const handleDiaryDelete = async () => {
    if (!diaryData?.id) {
      alert('삭제할 일기를 찾을 수 없습니다.');
      return;
    }

    try {
      console.log('Deleting diary with id:', diaryData.id);
      await deleteDiary(diaryData.id);
      
      // 삭제 성공 후 UI 업데이트
      setDiaryData(null);
      setShowDeleteModal(false);
      
      // 월별 일기 데이터를 다시 로드하여 달력 색칠 업데이트
      const updatedMonthlyData = await getMonthlyDiary(currentYear, currentMonth + 1);
      setMonthlyDiary(updatedMonthlyData);
      
    } catch (error) {
      console.error('일기 삭제 실패:', error);
      alert('일기 삭제에 실패했습니다.');
    }
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  }

  return (
    <main>
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
          {days.map((day: number | null, index) => {
            if (day === null) {
              return <div key={index} className={styles.emptyDay}></div>;
            }

            const isSelected = day === selectedDay;
            const isToday = 
              day === new Date().getDate() && 
              currentMonth === new Date().getMonth() && 
              currentYear === new Date().getFullYear();
            
            // 월별 일기 데이터에서 해당 날짜에 일기가 있는지 확인
            const hasContent = monthlyDiary?.diaryDates.includes(day) || false;
            
            // 해당 날짜의 감정 이모지 가져오기
            const emotionForDay = monthlyDiary?.emotions?.[day.toString()];
            const emotionEmoji = emotionForDay ? getEmotionEmoji(emotionForDay) : null;

            return (
              <div
                key={index}
                className={`${styles.dayItem} ${isSelected ? styles.selected : ''} ${hasContent ? styles.hasContent : ''} ${isToday ? styles.today : ''}`}
                onClick={() => handleDateClick(day)}
              >
                {isEmotion && emotionEmoji ? emotionEmoji : day}
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
              {diaryData.images && diaryData.images.length > 0 && (
                <div className={styles.imageContainer}>
                  <Image
                    src={diaryData.images[0]}
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
                <button className={`${styles.actionButton} ${styles.emotionBtn}`}>{getEmotionEmoji(diaryData.emotion)}</button>
                {(diaryData.memory && diaryData.memory.trim() !== '') && <button className={styles.actionButton}>{diaryData.memory}</button>}
                {diaryData.water && <button className={`${styles.actionButton} ${styles.plant}`}>급수</button>}
                {diaryData.sun && <button className={`${styles.actionButton} ${styles.plant}`}>햇빛 조절</button>}
              </div>
              <div className={styles.deleteButtonContainer}>
                <div onClick={openDeleteModal} className={styles.deleteButton}>삭제하기</div>
              </div>
            </div>
          ) : (
            (() => {
              // 선택된 날짜가 오늘 이후인지 확인
              const today = new Date();
              const selectedDateObj = new Date(currentYear, currentMonth, selectedDay);
              
              // 날짜만 비교 (시간 제외)
              const isToday = selectedDateObj.toDateString() === today.toDateString();
              const isPastDate = selectedDateObj < today;
              const canWrite = isToday || isPastDate;
              
              return (
                <div className={styles.noDiary}>
                  <p>선택한 날짜에 작성된 일기가 없습니다.</p>
                  {canWrite ? (
                    <Link href={`/diary/write?date=${currentYear}-${currentMonth + 1}-${selectedDay}`} className={styles.addDiaryButton}>
                      일기 작성하기
                    </Link>
                  ) : (
                    <p className={styles.futureMessage}>미래 날짜에는 일기를 작성할 수 없습니다.</p>
                  )}
                </div>
              );
            })()
          )}
        </div>

        {/* 댓글 섹션 */}
        <Comments
          comments={comments}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onEditComment={async (commentId: number, content: string) => {
            try {
              // API 호출
              const commentData: UpdateDiaryCommentData = { content };
              const updatedComment = await updateDiaryComment(commentId, commentData);

              // 로컬 상태 업데이트
              const localComment = convertAPICommentToLocal(updatedComment);
              setComments(prevComments =>
                prevComments.map(comment =>
                  comment.id === commentId ? localComment : comment
                )
              );
            } catch (error) {
              console.error('댓글 수정 실패:', error);
              // 로컬에서 직접 수정
              setComments(prevComments =>
                prevComments.map(comment =>
                  comment.id === commentId
                    ? { ...comment, content, timeAgo: "방금 전" }
                    : comment
                )
              );
            }
          }}
          onDeleteComment={async (commentId: number) => {
            try {
              // API 호출
              await deleteDiaryComment(commentId);

              // 로컬 상태 업데이트
              setComments(prevComments =>
                prevComments.filter(comment => comment.id !== commentId)
              );
            } catch (error) {
              console.error('댓글 삭제 실패:', error);
              // 로컬에서 직접 삭제
              setComments(prevComments =>
                prevComments.filter(comment => comment.id !== commentId)
              );
            }
          }}
          currentUserId={currentUser?.id}
        />
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>일기 삭제</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>정말로 이 일기를 삭제하시겠습니까?</p>
              <p className={styles.modalSubText}>삭제된 일기는 복구할 수 없습니다.</p>
            </div>
            <div className={styles.modalActions}>
              <button onClick={closeDeleteModal} className={styles.cancelButton}>
                취소
              </button>
              <button onClick={handleDiaryDelete} className={styles.confirmDeleteButton}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DiaryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiaryPageContent />
    </Suspense>
  );
}