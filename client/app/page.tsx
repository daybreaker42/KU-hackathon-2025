"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Footer from "./component/common/footer";
import Link from "next/link";
import { getDayDiary } from "./controller";

// 타입 정의
interface NavProps {
  text: string;
  img?: string;
}

function Nav({ text, img }: NavProps) {
  return(
    <div className={styles.nav}>
      <h2 className={styles.navTitle}>{text}</h2>
      {!img 
      ? <Link 
        className={styles.profile}
        href={"/user"}
      >
        <span className="material_symbols_outlined">
          account_circle
        </span>
      </Link>
      : <Image src={img} alt={text} width={50} height={50} />
      }
    </div>
  )
}

interface PlantProps {
  text: string;
  img: string;
}

function Plant({ text, img }: PlantProps) {
  return (
    <div className={styles.plant}>
      <Image className={styles.plantImg} src={img} alt={text} width={100} height={100} />
      <h2 className={styles.plantTitle}>{text}</h2>
    </div>
  )
}

interface TodoProps {
  today: string;
  todoList?: string[];
}

function Todo({ today, todoList }: TodoProps) {
  return (
    <div className={styles.todo}>
      <div className={styles.todoTitle}>오늘 할일 - {today}</div>
      <div className={styles.todoList}>
        {todoList?.length === 0
        ? "오늘 할 일 모두 완료 했어요."
        : todoList?.map((todo, index) => (
          <div className={styles.todoItem} key={'todoList' + index}>
            <div>{todo}</div>
            {index < todoList.length - 1 && <hr key={`todoListhr${index}`}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DiaryProps {
  dayIndex: number;
  onClick: (day: number) => void;
  diaryData?: {title: string; content: string; photo: string | null} | null;
}

function Diary({ dayIndex, onClick, diaryData }: DiaryProps) {
  // 현재 주의 날짜들을 계산하는 함수
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0(일) ~ 6(토)
    const dates = [];
    
    // 일요일부터 시작하는 주간 계산
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const weekDates = getCurrentWeekDates();
  const today = new Date();

  return (
    <div>
      <div className={styles.weekContainer}>
        {weekDates.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString();
          const isWritten = index % 2 === 0; // 임시로 짝수 날짜에만 작성된 일기 표시
          return (
            <div 
              key={`week-${index}`} 
              className={`
                ${styles.dayItem} ${isToday ? styles.today : ''} 
                ${(dayIndex === index && !isToday) ? styles.selected : ''} 
                ${isWritten ? styles.fill : ''}`}
              onClick={() => onClick(index)}
            >
              <div className={styles.dayDate}>{date.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.diarySection}>
        {diaryData ? (
          <div>
            <h3 className={styles.diaryTitle}>{diaryData.title}</h3>
            <div className={styles.diaryContent}>
                {diaryData.photo && (
                  <Image 
                    src={diaryData.photo} 
                    alt="Diary Photo" 
                    width={300} 
                    height={200} 
                    className={styles.diaryImage}
                  />
                )}
               <p className={styles.diaryText}>{diaryData.content}</p>
            </div>
          </div>
        ) : (
          <div className={styles.noDiary}>선택한 날짜에 작성된 일기가 없습니다.</div>
        )}
      </div>
    </div>
  )
}

interface Reaction {
  user: string;
  comment: string;
}

interface ReactionList {
  day: Date;
  title: string;
  list: Reaction[];
}

interface ReactionProps {
  reactionData: ReactionList[];
}

function Reaction({ reactionData, selectedDay }: ReactionProps & { selectedDay: Date }) {
  // 선택된 날짜의 반응 데이터 찾기 (날짜 비교를 위해 toDateString() 사용)
  const selectedReaction = reactionData.find(data => 
    data.day.toDateString() === selectedDay.toDateString()
  );
  const reactions = selectedReaction ? selectedReaction.list : [];

  return (
    <div className={styles.reaction}>
      <div className={styles.reactionTitle}>
        {selectedReaction ? selectedReaction.title : "친구들의 반응"}
      </div>
      <div className={styles.reactionList}>
        {reactions.length === 0 ? (
          <div className={styles.noReaction}>아직 반응이 없습니다.</div>
        ) : (
          reactions.map((reaction, index) => (
            <div key={`reaction-${index}`} className={styles.reactionItem}>
              <div className={styles.reactionUser}>{reaction.user}</div>
              <div className={styles.reactionComment}>{reaction.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


export default function Home() {
  const [navText, setNavText] = useState<string>("");
  const [plantContent, setPlantContent] = useState<PlantProps>({text: "", img: "/images/plant-normal.png"});
  const [today, setToday] = useState<string>("");
  const [todoList, setTodoList] = useState<string[]>([]);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [diaryData, setDiaryData] = useState<{title: string; content: string; photo: string | null} | null>(null);
  const [reactionData, setReactionData] = useState<ReactionList[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const timeCategories: string[] = [
    "좋은 아침 입니다.",
    "좋은 점심 입니다.",
    "좋은 저녁 입니다.",
    "오늘 하루는 어땠나요?"
  ];

  const getNavText= (): string => {
    const now = new Date();
    const hour: number = now.getHours();
    
    let timeIndex: number;
    if (hour >= 6 && hour < 11) {
      timeIndex = 0;
    } else if (hour >= 11 && hour < 16) {
      timeIndex = 1;
    } else if (hour >= 16 && hour < 21) {
      timeIndex = 2;
    } else {
      timeIndex = 3;
    }
    
    return timeCategories[timeIndex];
  };

  const getPlantContent = (): PlantProps => {
    return {
      text: "(식물 애칭)은 기분이 좋아요.",
      img: "/images/plant-normal.png"
    };
  }

  const getToday = (): string => {
    const now = new Date();
    return (now.getMonth() + 1) + '/' + now.getDate() + ' (' + now.toLocaleString('default', { weekday: 'short' }) + ')';
  };

  const getTodoList = (): string[] => {
    return [
      "식물1 물주기",
      "식물2 물주기"
    ];
  }

  const getReactionData = (): ReactionList[] => {
    return [
      {
        day: new Date("2025-08-25"), // 일요일
        title: "일요일 식물 일기",
        list: [
          { user: "엄마", comment: "주말에도 식물을 잘 돌보는구나!" },
          { user: "할머니", comment: "식물이 더 싱싱해 보이네" }
        ]
      },
      {
        day: new Date("2025-08-26"), // 월요일
        title: "월요일 식물 일기",
        list: [
          { user: "아빠", comment: "새로운 한 주 시작이네" },
          { user: "동생", comment: "식물도 월요병 있나?" }
        ]
      },
      {
        day: new Date("2025-08-27"), // 화요일
        title: "화요일 식물 일기",
        list: [
          { user: "엄마", comment: "잎이 더 많아진 것 같아" },
          { user: "할머니", comment: "물을 적당히 주는 게 중요해" }
        ]
      },
      {
        day: new Date("2025-08-28"), // 수요일 (오늘)
        title: "수요일 식물 일기",
        list: [
          { user: "엄마", comment: "우리 식물이 정말 예뻐졌네!" },
          { user: "아빠", comment: "물을 자주 줘야 할 것 같아" },
          { user: "할머니", comment: "잎이 더 무성해진 것 같다" },
          { user: "동생", comment: "나도 식물 키우고 싶어" }
        ]
      },
      {
        day: new Date("2025-08-29"), // 목요일
        title: "목요일 식물 일기",
        list: [
          { user: "아빠", comment: "목요일도 화이팅!" }
        ]
      },
      {
        day: new Date("2025-08-30"), // 금요일
        title: "금요일 식물 일기",
        list: [
          { user: "엄마", comment: "주말이 기다려지네" },
          { user: "동생", comment: "식물도 주말을 좋아할까?" }
        ]
      },
      {
        day: new Date("2025-08-31"), // 토요일
        title: "토요일 식물 일기",
        list: [
          { user: "할머니", comment: "8월의 마지막 날이네" },
          { user: "엄마", comment: "이번 달도 식물을 잘 키웠어" }
        ]
      }
    ];
  }

  // 오늘 날짜의 주간 인덱스를 구하는 함수
  const getTodayIndex = (): number => {
    const today = new Date();
    return today.getDay(); // 0(일) ~ 6(토)
  };

  useEffect(() => {
    setNavText(getNavText());
    setPlantContent(getPlantContent());
    setToday(getToday());
    setTodoList(getTodoList());
    setReactionData(getReactionData()); // 반응 데이터 설정
    setDayIndex(getTodayIndex()); // 오늘 날짜의 인덱스로 초기화
    
    // 오늘 날짜를 Date 객체로 설정
    const today = new Date();
    setSelectedDay(today);

    // 오늘 일기 가져오기
    const getDiary = async () => {
      const diary = await getDayDiary(new Date());
      setDiaryData(diary);
    };

    getDiary();
  }, []);

  const handleDayClick = async (dayIndex: number) => {
    // 선택된 인덱스에 해당하는 실제 날짜를 계산
    const getCurrentWeekDates = () => {
      const today = new Date();
      const currentDay = today.getDay();
      const dates = [];
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
      }
      
      return dates;
    };
    
    const weekDates = getCurrentWeekDates();
    const selectedDate = weekDates[dayIndex]; // Date 객체 그대로 전달
    
    // 선택된 날짜를 Date 객체로 설정
    setSelectedDay(selectedDate);
    setDayIndex(dayIndex);
    
    const diary = await getDayDiary(selectedDate);
    setDiaryData(diary);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Nav text={navText} img={""} />
          <Plant text={plantContent.text} img={plantContent.img} />
          <Todo today={today} todoList={todoList} />
          <div>
            <div className={styles.label}>작성한 일기</div>
            <Diary dayIndex={dayIndex} onClick={handleDayClick} diaryData={diaryData}/>
          </div>
          <div>
            <div className={styles.label}>친구들 반응</div>
            <Reaction reactionData={reactionData} selectedDay={selectedDay} />
          </div>
        </div>
      </div>
      <Footer url=""/>
    </main>
  );
}
