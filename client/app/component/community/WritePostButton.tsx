import Link from 'next/link';

export default function WritePostButton() {
  return (
    <div className="fixed bottom-[80px] z-10 w-[393px] left-1/2 -translate-x-1/2 px-[24px] pointer-events-none">
        <Link
          href="/community/write"
          className="bg-[#42CA71] text-white font-medium py-3 px-5 rounded-full shadow-lg hover:bg-[#369F5C] transition-colors flex items-center gap-1 w-fit ml-auto pointer-events-auto"
        >
          <span>+</span>
          <span>글 쓰기</span>
        </Link>
    </div>
  );
}
