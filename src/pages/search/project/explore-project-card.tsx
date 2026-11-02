import CalendarIcon from '@assets/icons/calendar-clock.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import ProfileDefaultImage from '@assets/images/Profile_dark.svg';
import BookmarkButton from '@components/common/BookmarkButton';
import DomainBadge from '@components/common/DomainBadge';
import { Clock3, Monitor } from 'lucide-react';
import type { HomeProject } from '../../home/home-mock-data';
import ExploreTechBadges from './explore-tech-badges';
import './project-explore-page.css';

const statusLabels: Record<HomeProject['status'], string> = { recruiting: '모집 중', inProgress: '진행 중', completed: '완료' };

type Props = { project: HomeProject; saved: boolean; onOpen: () => void; onBookmarkChange: (next: boolean) => void };
export default function ExploreProjectCard({ project, saved, onOpen, onBookmarkChange }: Props) {
  return <article className="explore-card" data-project-id={project.id}>
          <button type="button" className="explore-card-main" onClick={onOpen} aria-label={`${project.title} 프로젝트 미리보기`}>
            <div className="explore-art"><span className={`explore-status ${project.status}`}><span />{statusLabels[project.status]}</span><img src={project.thumbnail} alt="" /></div>
            <div className="explore-card-info"><DomainBadge className="explore-domain" domain={project.domain} /><div className="explore-card-heading"><h2>{project.title}</h2><p>{project.description}</p></div></div>
            <div className="explore-members">
              <div className="explore-member-line">
                <div className="explore-member-avatars" aria-hidden="true">
                  {Array.from({ length: Math.min(project.memberCount.current, 2) }, (_, i) => <img key={i} src={ProfileDefaultImage} alt="" />)}
                  {project.memberCount.current > 2 && <span className="explore-member-extra">+{project.memberCount.current - 2}</span>}
                </div>
                <span><PersonIcon aria-hidden="true" />{project.memberCount.current}/{project.memberCount.total}명 모집</span>
              </div>
              <div className="explore-progress" aria-hidden="true">{Array.from({ length: project.memberCount.total }, (_, i) => <span key={i} className={i < project.memberCount.current ? 'filled' : ''} />)}</div>
            </div>
            <div className="explore-project-footer"><ExploreTechBadges stacks={project.techStacks} /><div className="explore-project-meta" aria-label="프로젝트 진행 정보"><span><Monitor aria-hidden="true" />{project.workMode}</span><span><Clock3 aria-hidden="true" />예상 {project.duration}</span><span><CalendarIcon aria-hidden="true" />{project.deadline.remaining > 0 ? `D-${project.deadline.remaining}` : project.deadline.remaining === 0 ? 'D-DAY' : '종료'}</span></div></div>
          </button>
          <BookmarkButton className="explore-bookmark" aria-label={project.title} bookmarked={saved} onBookmarkChange={onBookmarkChange} />
        </article>;
}
