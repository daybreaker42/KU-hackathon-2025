"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Footer from "./component/common/footer";
import Link from "next/link";

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
      <h2>{text}</h2>
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

function Dairy() {
  return (
    <div>
      작성한  일기
    </div>
  )
}

function Reaction() {
  return (
    <div style={{height: '500px'}}>반응</div>
  )
}


export default function Home() {
  const [navText, setNavText] = useState<string>("");
  const [plantContent, setPlantContent] = useState<PlantProps>({text: "", img: "/plant-normal.png"});

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
      img: "/plant-normal.png"
    };
  }

  useEffect(() => {
    setNavText(getNavText());
    setPlantContent(getPlantContent());
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Nav text={navText} img={""} />
          <Plant text={plantContent.text} img={plantContent.img} />
          <Todo />
          <Dairy />
          <Reaction />
        </div>
      </div>
      <Footer url=""/>
    </main>
  );
}
