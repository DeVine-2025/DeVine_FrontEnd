import CalendarIcon from '@assets/icons/calendar-clock.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import ProfileDefaultImage from '@assets/images/Profile_dark.svg';
import BookmarkButton from '@components/common/BookmarkButton';
import DomainBadge from '@components/common/DomainBadge';
import { Clock3, Monitor } from 'lucide-react';
import type { ProjectCardData } from './card-types';
import TechStackBadges from './TechStackBadges';
import ProjectStatusBadge from './ProjectStatusBadge';
import RecruitmentProgress from './RecruitmentProgress';
import './project-card.css';

type Props = { project: ProjectCardData; saved?: boolean; onOpen?: () => void; openLabel?: string; onBookmarkChange?: (next: boolean) => void; variant: 'list' | 'grid'; showTechStacks?: boolean; showProfiles?: boolean; wideImage?: boolean };
export default function ProjectCard({ project, saved = false, onOpen, openLabel, onBookmarkChange, variant, showTechStacks = true, showProfiles = false, wideImage = false }: Props) {
  const CardBody = onOpen ? 'button' : 'div';
  const actionProps = onOpen ? { type: 'button' as const, onClick: onOpen, 'aria-label': openLabel ?? project.title + ' 프로젝트 미리보기' } : {};
  return <article className={`explore-card project-card--${variant}${showProfiles ? ' project-card--profiles' : ''}${wideImage ? ' project-card--wide-image' : ''}`} data-project-id={project.id}>
          <CardBody className="explore-card-main" {...actionProps}>
            <div className="explore-art">{project.status && <ProjectStatusBadge status={project.status} />}<img src={project.thumbnail} alt="" /></div>
            <div className="explore-card-info">{project.domain && <DomainBadge className="explore-domain" domain={project.domain} />}<div className="explore-card-heading"><h2>{project.title}</h2><p>{project.description}</p></div></div>
            <div className="explore-members">
              <div className="explore-member-line">
                <div className="explore-member-avatars" aria-hidden="true">
                  {Array.from({ length: Math.min(project.memberCount.current, 2) }, (_, i) => <img key={i} src={ProfileDefaultImage} alt="" />)}
                  {project.memberCount.current > 2 && <span className="explore-member-extra">+{project.memberCount.current - 2}</span>}
                </div>
                <span><PersonIcon aria-hidden="true" />{project.memberCount.total > 0 ? `${project.memberCount.current}/${project.memberCount.total}명 모집` : '모집 인원 확인'}</span>
              </div>
              {project.memberCount.total > 0 && <RecruitmentProgress current={project.memberCount.current} total={project.memberCount.total} className="explore-progress" filledClassName="filled" />}
            </div>
            <div className="explore-project-footer">{showTechStacks && <TechStackBadges stacks={project.techStacks} />}<div className="explore-project-meta" aria-label="프로젝트 진행 정보">{project.workMode && <span><Monitor aria-hidden="true" />{project.workMode}</span>}{project.duration && <span><Clock3 aria-hidden="true" />예상 {project.duration}</span>}{project.deadline.remaining !== null && <span><CalendarIcon aria-hidden="true" />{project.deadline.remaining > 0 ? `D-${project.deadline.remaining}` : project.deadline.remaining === 0 ? 'D-DAY' : '종료'}</span>}</div></div>
          </CardBody>
          {onBookmarkChange && <BookmarkButton className="explore-bookmark" aria-label={project.title} bookmarked={saved} onBookmarkChange={onBookmarkChange} />}
        </article>;
}
