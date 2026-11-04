import './home-recommended-project-card.css';
import { useId } from 'react';
import CheckIcon from '@assets/icons/check.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import CalendarIcon from '@assets/icons/calendar-clock.svg?react';
import BookmarkButton from '@components/common/BookmarkButton';
import DomainBadge from '@components/common/DomainBadge';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import type { ProjectCardData } from './card-types';
import RecruitmentProgress from './RecruitmentProgress';

type HomeRecommendedProjectCardData = ProjectCardData & { recommendation?: { score: number; reason: string }; posted?: string };

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

export default function HomeRecommendedProjectCard({
  project,
  featured,
  recent,
  recommended,
  saved,
  onToggle,
  onOpen,
}: {
  project: HomeRecommendedProjectCardData;
  featured?: boolean;
  recent?: boolean;
  recommended?: boolean;
  saved: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const gradientId = useId();
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
              {project.domain && <DomainBadge className="home-project-domain-badge" domain={project.domain} />}
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
            <p className="home-recommended-reason"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.6L16 9.5" /></svg>{reason}</p>
            <div className="home-recommended-stats">
              <div className="home-recommended-stat home-recommended-score" aria-label={`추천 적합도 예시 ${score}점`}>
                <span className="home-recommended-label">추천 적합도</span>
                <div className="home-recommended-ring" aria-hidden="true">
                  <svg width="0" height="0" style={{ position: 'absolute' }} focusable="false" aria-hidden="true"><defs><linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8069ed" /><stop offset="100%" stopColor="#d0c3ff" /></linearGradient></defs></svg>
                  <CircularProgressbarWithChildren value={score} strokeWidth={9} styles={buildStyles({ pathColor: `url(#${gradientId})`, trailColor: '#343945', strokeLinecap: 'round' })}>
                    <strong>{score}</strong>
                  </CircularProgressbarWithChildren>
                </div>
              </div>
              <div className="home-recommended-stat home-recommended-members">
                <span className="home-recommended-label">모집 현황</span>
                <strong aria-label={`모집 인원 ${project.memberCount.total}명 중 ${project.memberCount.current}명`}>{project.memberCount.current} / {project.memberCount.total}명</strong>
                {project.memberCount.total > 0 && (
                  <RecruitmentProgress current={project.memberCount.current} total={project.memberCount.total} className="home-project-progress" filledClassName="is-filled" container="span" />
                )}
              </div>
              <div className="home-recommended-stat home-recommended-deadline">
                <strong>{project.deadline.remaining == null ? '일정 미정' : project.deadline.remaining < 0 ? '마감' : project.deadline.remaining === 0 ? 'D-Day' : `D-${project.deadline.remaining}`}</strong>
                <span className="home-recommended-date"><CalendarIcon aria-hidden="true" />{project.deadline.date}</span>
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
