import './home-recommended-project-card.css';
import { Clock3, Monitor, Sparkles } from 'lucide-react';
import ProfileDefaultImage from '@assets/images/Profile_dark.svg';
import CheckIcon from '@assets/icons/check.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import CalendarIcon from '@assets/icons/calendar-clock.svg?react';
import BookmarkButton from '@components/common/BookmarkButton';
import DomainBadge from '@components/common/DomainBadge';
import type { ProjectCardData } from './card-types';
import RecruitmentProgress from './RecruitmentProgress';

type RecommendedProjectCardData = ProjectCardData & { recommendation?: { score: number; reason: string }; posted?: string };

function Bookmark({
  name,
  selected,
  onToggle,
}: {
  name: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <BookmarkButton
      className="home-bookmark"
      aria-label={name}
      bookmarked={selected}
      onBookmarkChange={onToggle}
    />
  );
}

export default function RecommendedProjectCard({
  project,
  featured,
  recent,
  recommended,
  saved,
  onToggle,
  onOpen,
}: {
  project: RecommendedProjectCardData;
  featured?: boolean;
  recent?: boolean;
  recommended?: boolean;
  saved: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  if (recommended && project.recommendation) {
    const { score, reason } = project.recommendation;
    return (
      <article className="home-project-card home-project-recommended">
        <button type="button" className="home-card-open" onClick={onOpen} aria-label={`${project.title} 프로젝트 미리보기`}>
          <div className="home-project-art">
            <img src={project.thumbnail} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="home-recommended-content">
            <div className="home-recommended-summary">
              <div className="mb-[10px] flex flex-wrap items-center justify-between gap-[8px]">
                {project.domain && <DomainBadge className="home-project-domain-badge" domain={project.domain} />}
                <span className="home-recommended-score" aria-label={`추천 적합도 예시 ${score}점`}><Sparkles aria-hidden="true" />추천 적합도 <strong>{score}</strong></span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
            <p className="home-recommended-reason"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.6L16 9.5" /></svg>{reason}</p>
            <div className="home-recommended-stats flex flex-col gap-[10px]">
              <div className="home-recommended-members grid gap-[7px]">
                <div className="flex items-center gap-[8px] text-[12px] text-[var(--text-secondary)]">
                  <span className="home-recommended-avatars flex items-center" aria-hidden="true">
                    {Array.from({ length: Math.min(project.memberCount.current, 2) }, (_, index) => <img key={index} src={ProfileDefaultImage} alt="" />)}
                    {project.memberCount.current > 2 && <span>+{project.memberCount.current - 2}</span>}
                  </span>
                  <span>{project.memberCount.total > 0 ? `${project.memberCount.current}/${project.memberCount.total}명 모집` : '모집 인원 확인'}</span>
                </div>
                {project.memberCount.total > 0 && (
                  <RecruitmentProgress current={project.memberCount.current} total={project.memberCount.total} className="home-project-progress" filledClassName="is-filled" container="span" />
                )}
              </div>
              <div className="home-recommended-meta flex flex-wrap items-center gap-x-[14px] gap-y-[8px] border-t border-[var(--project-divider)] pt-[12px] text-[12px] text-[var(--text-secondary)]" aria-label="프로젝트 진행 정보">
                {project.workMode && <span><Monitor aria-hidden="true" />{project.workMode}</span>}
                {project.duration && <span><Clock3 aria-hidden="true" />예상 {project.duration}</span>}
                {project.deadline.remaining != null && <span><CalendarIcon aria-hidden="true" />{project.deadline.remaining < 0 ? '마감' : project.deadline.remaining === 0 ? 'D-Day' : `D-${project.deadline.remaining}`}</span>}
              </div>
            </div>
          </div>
        </button>
        <Bookmark name={project.title} selected={saved} onToggle={onToggle} />
      </article>
    );
  }

  return (
    <article
      style={{ backgroundImage: `url("${project.thumbnail}")` }}
      className={[
        'home-project-card',
        featured && 'home-project-featured',
        recent && 'home-project-recent',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="home-card-open"
        onClick={onOpen}
        aria-label={`${project.title} 프로젝트 미리보기`}
      >
        <div className="home-project-art">
          {!recommended && (
            <span className={`home-project-status home-project-status-${project.status}`}>
              <span />{project.status === 'recruiting' ? '모집 중' : project.status === 'inProgress' ? '진행 중' : '완료'}
            </span>
          )}
          <img src={project.thumbnail} alt="" loading={featured ? 'eager' : 'lazy'} decoding="async" />
        </div>
        <div className="home-project-content">
          <div className="home-project-summary">
            {project.domain && <DomainBadge className="home-project-domain-badge" domain={project.domain} />}
            <div className="home-project-title-row">
              <h3>{project.title}</h3>
              {recommended && project.recommendation && (
                <span className="home-project-match">
                  <strong>{project.recommendation.score}점</strong>
                  <span className="home-project-match-info" aria-label="점수 안내: 기술과 관심 분야를 바탕으로 만든 추천 예시 점수입니다" title="기술과 관심 분야를 바탕으로 만든 추천 예시 점수입니다">
                    ⓘ
                    <span className="home-project-match-tooltip" role="tooltip">기술과 관심 분야를 바탕으로 만든 추천 예시 점수입니다.</span>
                  </span>
                </span>
              )}
            </div>
            <p>{project.description}</p>
          </div>
          {recommended && project.recommendation && (
            <div className="home-project-fit">
              <progress aria-label="프로젝트 적합도 (샘플)" max={100} value={project.recommendation.score} />
              <p><CheckIcon className="home-project-fit-check" aria-hidden="true" />{project.recommendation.reason}</p>
            </div>
          )}
          <div className="home-project-details">
            <div className="home-project-bottom-line">
              <span className="home-project-members">
                <span className="home-project-member-count" aria-label={`모집 인원 ${project.memberCount.total}명 중 ${project.memberCount.current}명`}>
                  <PersonIcon aria-hidden="true" />{project.memberCount.current}/{project.memberCount.total}명 모집
                </span>
                {!recommended && project.memberCount.total > 0 && (
                  <RecruitmentProgress current={project.memberCount.current} total={project.memberCount.total} className="home-project-progress" filledClassName="is-filled" container="span" />
                )}
              </span>
              <span className="home-project-deadline" aria-label={`마감까지 D-${project.deadline.remaining}, ${project.deadline.date}`}>
                <strong>{project.deadline.remaining == null ? '일정 미정' : project.deadline.remaining < 0 ? '마감' : project.deadline.remaining === 0 ? 'D-Day' : `D-${project.deadline.remaining}`}</strong>
                <small><CalendarIcon aria-hidden="true" />{project.deadline.date}</small>
              </span>
            </div>
            <div className="home-project-meta">
              <span className="home-project-conditions">
                <span>{project.duration}</span>
                <span>{project.workMode}</span>
              </span>
              {project.posted && <span className="home-project-posted">{project.posted}</span>}
            </div>
          </div>
        </div>
      </button>
      <Bookmark name={project.title} selected={saved} onToggle={onToggle} />
    </article>
  );
}
