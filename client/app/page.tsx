"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

// 타입 정의
interface NavProps {
  text: string;
  img?: string;
}

interface TimeCategory {
  text: string;
  img: string;
}

function Nav({ text, img }: NavProps) {
  return(
    <div>
      <h2>{text}</h2>
      {!img 
      ? <div><span className="material_symbols_outlined">
          account_circle
        </span></div>
      : <Image src={img} alt={text} width={50} height={50} />
      }
    </div>
  )
}

function Plant() {
  return (
    <div>
      <h2>식물 컴포넌트</h2>
      {/* <Image src={currentImg} alt={currentText} width={100} height={100} /> */}
    </div>
  )
}

function Todo() {
  return (
    <div>
      <span>할 일 컴포넌트</span>
    </div>
  );
}

export default function Home() {
  const [currentText, setCurrentText] = useState<string>("");
  const [currentImg, setCurrentImg] = useState<string>("/plant-normal.png");

  const timeCategories: TimeCategory[] = [
    {
      text: "좋은 아침 입니다.",
      img: "/plant-happy.png"
    },
    {
      text: "좋은 점심 입니다.", 
      img: "/plant-normal.png"
    },
    {
      text: "좋은 저녁 입니다.",
      img: "/plant-normal.png"
    },
    {
      text: "오늘 하루는 어땠나요?",
      img: "/plant-sick.png"
    }
  ];

  const getTimeBasedContent = (): TimeCategory => {
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

  useEffect(() => {
    const content: TimeCategory = getTimeBasedContent();
    setCurrentText(content.text);
    setCurrentImg(content.img);
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Nav text={currentText} img={""} />
        <Plant/>
      </div>
    </main>
  );
}
