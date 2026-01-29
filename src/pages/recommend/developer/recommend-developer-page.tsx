import DeveloperFilterBar, { type DeveloperFilterKey } from '@components/common/DeveloperFilterBar';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import { useState } from 'react';
import { DEVELOPER_FILTERS, PROFILE_CARD_LIST } from 'src/mocks/developer.mock';

const RecommendDeveloperPage = () => {
  const [openFilter, setOpenFilter] = useState<DeveloperFilterKey | null>(null);
  const [interestDomains, setInterestDomains] = useState<string[]>([]);
  const [myProjects, setMyProjects] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
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

      {/* 개발자 카드 리스트 */}
      {PROFILE_CARD_LIST.map((dev) => (
        <RecommendDeveloperCard
          key={dev.id}
          role={dev.role}
          roleTone={dev.roleTone}
          nickname={dev.nickname}
          introduction={dev.introduction}
          domains={dev.badges?.slice(0, 3).map((b) => ({ label: b.label }))}
          techStack={dev.techStack}
          bookmarked={dev.bookmarked}
          onBookmarkChange={(next) => console.log('bookmark', dev.id, next)}
          onClick={() => console.log('click developer', dev.id)}
        />
      ))}
    </div>
  );
};

export default RecommendDeveloperPage;
