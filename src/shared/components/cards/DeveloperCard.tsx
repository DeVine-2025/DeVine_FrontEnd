import { useId, useState } from 'react';
import { Clock3, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileDefaultDark from '@assets/images/Profile_dark.svg';
import BookmarkButton from '@components/common/BookmarkButton';
import type { DeveloperSearchContentDto } from '@t/profileCard.types';
import { ROLE_LABEL, ROLE_PRIORITY } from '@t/member';
import TechStackBadges from './TechStackBadges';
import PositionBadge from './PositionBadge';
import { getCollaborationPreview } from './developer-collaboration-preview';
import './developer-card.css';

type Props = {
  developer: DeveloperSearchContentDto;
  bookmarked: boolean;
  pending: boolean;
  onBookmarkChange?: (next: boolean) => void;
  onOpen?: () => void;
  roleLabel?: string;
  showTechStacks?: boolean;
  showProfileLink?: boolean;
  showConditions?: boolean;
  variant: 'list' | 'grid';
};

export default function DeveloperCard({ developer, bookmarked, pending, onBookmarkChange, onOpen, roleLabel, showTechStacks = true, showProfileLink = true, showConditions = true, variant }: Props) {
  const { member } = developer;
  const techstacks = developer.techstacks ?? [];
  const [skillsOpen, setSkillsOpen] = useState(false);
  const skillsId = useId();
  const roleCodes = techstacks.filter(stack => stack.genre == null).map(stack => stack.name);
  const role = ROLE_PRIORITY.find(code => roleCodes.includes(code)) ?? 'DEVELOPER';
  const skills = [...new Set(techstacks.filter(stack => stack.genre != null).map(stack => stack.name))];
  const preview = getCollaborationPreview(member.nickname);

  return <article className={`developer-explore-card developer-card--${variant}`} data-nickname={member.nickname}>
    <div className="developer-card-identity">
      <img className="developer-explore-avatar" src={member.imageUrl || ProfileDefaultDark} alt="" width="80" height="80" />
      <div className="developer-card-person">
        <PositionBadge position={roleLabel ?? ROLE_LABEL[role]} />
        <h2>{showProfileLink ? <Link className="developer-card-profile-link" to={`/developer-detail/${encodeURIComponent(member.nickname)}`} onClick={onOpen ? event => { event.preventDefault(); onOpen(); } : undefined} aria-label={`${member.nickname} 프로필 보기`}>{member.nickname}</Link> : member.nickname}</h2>
        <div className="developer-card-introduction"><p>{member.body?.trim() || '아직 작성된 소개가 없어요.'}</p></div>
      </div>
    </div>
    {onBookmarkChange && <BookmarkButton className="developer-explore-bookmark" aria-label={member.nickname} bookmarked={bookmarked} pending={pending} onBookmarkChange={onBookmarkChange} />}

    <div className="developer-card-footer">
      {showConditions && <div className="developer-card-conditions" aria-label="협업 조건"><span><Clock3 aria-hidden="true" />{preview.schedule}</span><span><Monitor aria-hidden="true" />{preview.method}</span></div>}
      {showTechStacks && <div className="developer-card-skills" aria-label="보유 기술 스택">
        {skills.length ? <>
          <div id={skillsId}><TechStackBadges stacks={skillsOpen ? skills : skills.slice(0, 3)} /></div>
          {skills.length > 3 && <button type="button" className="developer-card-skills-more" aria-expanded={skillsOpen} aria-controls={skillsId} aria-label={skillsOpen ? '추가 기술 스택 접기' : `추가 기술 스택 ${skills.length - 3}개 보기`} onClick={() => setSkillsOpen(open => !open)}>{skillsOpen ? '접기' : `+${skills.length - 3}`}</button>}
        </> : <p className="developer-card-skills-empty">등록된 기술 스택이 없어요.</p>}
      </div>}
    </div>
  </article>;
}
