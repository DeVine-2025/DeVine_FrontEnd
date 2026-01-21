import ProfileCard from '@components/common/ProfileCard';
import { useNavigate } from 'react-router-dom';
import { PROFILE_CARD_LIST } from 'src/mocks/developer.mock';

const DeveloperSearchPage = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 추천 개발자 */}
      <header className="flex items-center justify-between">
        <h2 className="pl-5 font-semibold text-[16px] text-card-title">
          추천 개발자 (UX라이팅 수정예정)
        </h2>

        <button
          type="button"
          onClick={() => navigate('/recommend')}
          className="inline-flex cursor-pointer items-center gap-2 text-card-muted text-lg hover:opacity-80"
        >
          더 많은 추천 개발자 보러가기 <span aria-hidden="true">›</span>
        </button>
      </header>

      {/* 추천 개발자 카드 */}
      <div className="scrollbar-hide flex justify-center gap-6 overflow-x-auto">
        {PROFILE_CARD_LIST.map((profile) => (
          <ProfileCard key={profile.id} {...profile} />
        ))}
      </div>

      {/* 구분선 */}
      <div className="h-px w-full bg-card-border" />

      {/* 개발자 리스트 (세로) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">개발자 리스트</div>
    </section>
  );
};

export default DeveloperSearchPage;
