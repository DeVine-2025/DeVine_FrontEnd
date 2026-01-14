// src/pages/main/main-page.tsx
import ProfileCard from '@components/common/ProfileCard';
import { useThemeStore } from '@store/theme';

const MainPage = () => {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <div className="p-6 flex flex-col gap-6">
      <button type="button" onClick={toggleTheme} className="rounded-md bg-white000 px-3 py-2">
        UI 모드 토글
      </button>

      <ProfileCard
        size="sm"
        className="w-[310px]" 
        role="백엔드"
        roleTone="green"
        nickname="문수영"
        profileImageUrl="/sample.jpg"
        location="서울 강남구"
        experience="2년 6개월"
        introduction="한줄 소개가 들어가는 자리입니다. 한줄 소개가 들어가는 자리입니다."
        badges={[{ label: '백엔드', tone: 'green' }]}
        techStack={[{ id: 'py', name: 'Python' }]}
        recommendationReason="추천하는 이유가 들어가는 자리입니다."
      />
    </div>
  );
};

export default MainPage;
