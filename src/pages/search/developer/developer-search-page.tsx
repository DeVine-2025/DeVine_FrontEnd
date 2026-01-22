import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import ProfileCard from '@components/common/ProfileCard';
import { useNavigate } from 'react-router-dom';
import { PROFILE_CARD_LIST, PROFILE_FILTERS } from 'src/mocks/developer.mock';

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
          <ProfileCard key={profile.id} {...profile} size="sm" />
        ))}
      </div>

      {/* 구분선 */}
      <div className="h-px w-full bg-card-border" />

      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        {PROFILE_FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-filter-bg px-5 py-3 font-medium text-filter-text text-xl"
          >
            {label}
            <ChevronDownIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* 개발자 리스트 */}
      <div className="flex flex-col gap-4">
        {PROFILE_CARD_LIST.map((profile) => (
          <ProfileCard key={profile.id} {...profile} size="lg" />
        ))}
      </div>
    </section>
  );
};

export default DeveloperSearchPage;
