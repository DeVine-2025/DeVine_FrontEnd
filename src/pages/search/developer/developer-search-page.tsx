import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import ProfileCard from '@components/common/ProfileCard';
import { useFilterStore } from '@store/filter';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEVELOPER_FILTERS, PROFILE_CARD_LIST } from 'src/mocks/developer.mock';

const DeveloperSearchPage = () => {
  const navigate = useNavigate();
  const { developerSearch, setDeveloperSearch } = useFilterStore();
  const { interestDomains, myProjects, techStacks } = developerSearch;

  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);

  const setInterestDomains = (v: string[]) => setDeveloperSearch({ interestDomains: v });
  const setMyProjects = (v: string[]) => setDeveloperSearch({ myProjects: v });
  const setTechStacks = (v: string[]) => setDeveloperSearch({ techStacks: v });

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 추천 개발자 */}
      <header className="flex items-center justify-between">
        <h2 className="pl-5 font-semibold text-[16px] text-card-title">추천 개발자</h2>

        <button
          type="button"
          onClick={() => navigate('/recommend')}
          className="inline-flex cursor-pointer items-center gap-2 font-medium text-card-muted text-xl hover:opacity-80"
        >
          더 많은 추천 개발자 보러가기
          <span aria-hidden="true" className="text-3xl leading-none">
            ›
          </span>
        </button>
      </header>

      {/* 추천 개발자 카드 */}
      <div className="scrollbar-hide flex justify-between gap-6 overflow-x-auto">
        {PROFILE_CARD_LIST.map((profile) => (
          <ProfileCard key={profile.id} {...profile} size="sm" />
        ))}
      </div>

      {/* 구분선 */}
      <div className="h-px w-full bg-card-border" />

      {/* 필터 */}
      <DeveloperFilterBar
        filters={DEVELOPER_FILTERS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        myProjects={myProjects}
        setMyProjects={setMyProjects}
        techStacks={techStacks}
        setTechStacks={setTechStacks}
        interestDomains={interestDomains}
        setInterestDomains={setInterestDomains}
        onApply={(key) => console.log('apply', key)}
        onReset={(key) => console.log('reset', key)}
      />

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
