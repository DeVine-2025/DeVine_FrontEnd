import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import DomainDropdown from '@components/recommend/DomainDropdown';
import MyProjectDropdown from '@components/recommend/MyProjectDropdown';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';
import { useState } from 'react';
import { PROFILE_CARD_LIST } from 'src/mocks/recommendDeveloper.mock';

const DEVELOPER_FILTERS = ['내 프로젝트 선택', '포지션 / 기술스택', '관심 도메인'] as const;

const RecommendDeveloperPage = () => {
  const [openFilter, setOpenFilter] = useState<null | (typeof DEVELOPER_FILTERS)[number]>(null);
  const [interestDomains, setInterestDomains] = useState<string[]>([]);
  const [myProjects, setMyProjects] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        {DEVELOPER_FILTERS.map((label) => (
          <div key={label} className="relative">
            {(() => {
              const isMyProject = label === '내 프로젝트 선택';
              const isTechStack = label === '포지션 / 기술스택';
              const isInterestDomain = label === '관심 도메인';
              const values = isMyProject
                ? myProjects
                : isTechStack
                  ? techStacks
                  : isInterestDomain
                    ? interestDomains
                    : [];

              const isApplied = values.length > 0;
              const uniq = Array.from(new Set(values));
              const shown = uniq.slice(0, 2);
              const rest = Math.max(0, uniq.length - shown.length);
              const summary = `${shown.join(',')}${rest > 0 ? '…' : ''}`;
              const displayLabel = isApplied ? summary : label;

              return (
                <button
                  type="button"
                  onClick={() => setOpenFilter((prev) => (prev === label ? null : label))}
                  className={
                    isApplied
                      ? 'inline-flex max-w-[260px] cursor-pointer items-center gap-[10px] rounded-full border border-[var(--badge-bg-primary)] bg-[var(--badge-bg-primary)] px-5 py-[12px] font-semibold text-[var(--badge-text-primary)] text-xl'
                      : 'inline-flex max-w-[260px] cursor-pointer items-center gap-[10px] rounded-full border border-transparent bg-filter-bg px-5 py-[12px] font-semibold text-filter-text text-xl'
                  }
                >
                  <span className="truncate">{displayLabel}</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className={
                      isApplied
                        ? 'h-[14px] w-[14px] text-[var(--badge-text-primary)]'
                        : 'h-[14px] w-[14px]'
                    }
                  />
                </button>
              );
            })()}
            {label === '내 프로젝트 선택' ? (
              <MyProjectDropdown
                open={openFilter === '내 프로젝트 선택'}
                value={myProjects}
                onChange={setMyProjects}
                onApply={() => console.log('apply myProjects', myProjects)}
                onReset={() => console.log('reset myProjects')}
                onClose={() => setOpenFilter(null)}
              />
            ) : label === '포지션 / 기술스택' ? (
              <PositionTechStackDropdown
                open={openFilter === '포지션 / 기술스택'}
                value={techStacks}
                onChange={setTechStacks}
                onApply={() => console.log('apply techStacks', techStacks)}
                onReset={() => console.log('reset techStacks')}
                onClose={() => setOpenFilter(null)}
              />
            ) : label === '관심 도메인' ? (
              <DomainDropdown
                open={openFilter === '관심 도메인'}
                title="관심 도메인"
                value={interestDomains}
                onChange={setInterestDomains}
                onApply={() => console.log('apply interestDomains', interestDomains)}
                onReset={() => console.log('reset interestDomains')}
                onClose={() => setOpenFilter(null)}
              />
            ) : null}
          </div>
        ))}
      </div>

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
