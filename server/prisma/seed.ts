// // prisma/seed.ts
// import { PrismaClient } from '@prisma/client';
// import {
//   usersData,
//   diaryData,
//   emotionData,
//   plantData,
//   taskLogData,
//   postData,
//   commentData,
//   likesData,
//   postImgData,
//   diaryImgData,
// } from '../src/mock-data';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('기존 데이터 삭제...');
//   await prisma.comment.deleteMany();
//   await prisma.likes.deleteMany();
//   await prisma.postImg.deleteMany();
//   await prisma.diaryImg.deleteMany();
//   await prisma.post.deleteMany();
//   await prisma.taskLog.deleteMany();
//   await prisma.plant.deleteMany();
//   await prisma.emotion.deleteMany();
//   await prisma.diary.deleteMany();
//   await prisma.user.deleteMany();

//   console.log('데이터 삽입 시작...');

//   // 사용자 데이터 삽입 (가장 먼저)
//   await prisma.user.createMany({ data: usersData });

//   // 나머지 데이터는 관계를 고려하여 순차적으로 삽입
//   await prisma.diary.createMany({ data: diaryData });
//   await prisma.emotion.createMany({ data: emotionData });
//   await prisma.plant.createMany({ data: plantData });
//   await prisma.taskLog.createMany({ data: taskLogData });
//   await prisma.post.createMany({ data: postData });
//   await prisma.comment.createMany({ data: commentData });
//   await prisma.likes.createMany({ data: likesData });
//   await prisma.postImg.createMany({ data: postImgData });
//   await prisma.diaryImg.createMany({ data: diaryImgData });

//   console.log('모든 데이터 삽입 완료!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
