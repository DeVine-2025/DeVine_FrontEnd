import { isTechnologySkill } from '@apis/techstacks';
import { myInfoQueries } from '@apis/myInfo/my-info.queries';
import GithubIcon from '@assets/icons/github.svg?react';
import { useUser } from '@clerk/clerk-react';
import { getTechDisplayName } from '@components/cards/TechStackBadges';
import TechStackChip from '@components/common/TechStackChip';
import ImagePreview from '@components/profileDetail/ImagePreview';
import { DOMAIN_REVERSE_MAP } from '@constants/domain';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bookmark, ExternalLink, Folder, MapPin, Pencil, Settings, UserRound } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './my-info-workspace.css';

const tabs = [
  { to: '/my-info', label: '프로필', icon: UserRound },
  { to: '/my-info?tab=my-projects', label: '내 프로젝트', icon: Folder },
  { to: '/my-info/bookmark', label: '북마크', icon: Bookmark },
  { to: '/my-info/setting', label: '설정', icon: Settings },
];

export default function MyInfoPage() {
  const { pathname, search } = useLocation();
  const { user } = useUser();
  const { data, isPending: profileLoading } = useQuery(myInfoQueries.profile());
  const { data: skills, isPending: skillsLoading } = useQuery(myInfoQueries.getMyTechStacks());
  const profile = data?.result;
  const member = profile?.member;
  const github = profile?.contacts?.find(contact => contact.type.toUpperCase() === 'GITHUB');
  const githubUsername = user?.externalAccounts.find(account => account.provider === 'github')?.username;
  const githubContactUrl = [github?.link, github?.value].find(url => url && /^https?:\/\/\S+$/i.test(url));
  const githubUrl = githubContactUrl || (githubUsername && 'https://github.com/' + encodeURIComponent(githubUsername));
  const domains = profile?.domains ?? [];
  const techStacks = [...new Set(
    (skills?.result?.techstacks ?? [])
      .filter(isTechnologySkill)
      .map(stack => getTechDisplayName(stack.name)),
  )];
  const tab = new URLSearchParams(search).get('tab');
  const activePath = pathname === '/my-info' && (tab === 'reports' || tab === 'my-projects')
    ? '/my-info?tab=' + tab
    : pathname;
  const { navRef, indicatorRef } = useElasticUnderline(activePath);

  return (
    <section className="my-info-workspace desktop-content" aria-label="내 프로필">
      <aside className="my-info-hero" aria-label="프로필 정보">
        {profileLoading ? <div role="status" aria-label="프로필 정보를 불러오는 중" className="my-info-skeleton-side"><span className="my-info-skeleton my-info-skeleton-avatar" /><span className="my-info-skeleton h-[22px] w-[110px]" /><span className="my-info-skeleton h-[14px] w-[150px]" /><span className="my-info-skeleton h-[40px] w-full rounded-full" /><span className="my-info-skeleton h-[15px] w-[90px]" /></div> : <>
        <ImagePreview isExist={Boolean(member?.imageUrl)} imageUrl={member?.imageUrl} className="my-info-avatar" alt="내 프로필 사진" />
        <div className="my-info-identity">
          <h1>{member?.nickname || member?.name || '내 프로필'}</h1>
          {member?.body && <p className="my-info-bio">{member.body}</p>}
        </div>
        <Link className="my-info-control my-info-edit" to="/profile-edit">
          <Pencil size={16} aria-hidden="true" /> 프로필 편집
        </Link>

        <div className="my-info-side-section my-info-contacts">
          {member?.address && <p><MapPin size={19} aria-hidden="true" /> {member.address}</p>}
          {githubUrl ? (
            <a href={githubUrl} target="_blank" rel="noreferrer">
              <GithubIcon aria-hidden="true" /> GitHub <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link to="/my-info/setting">
              <GithubIcon aria-hidden="true" /> GitHub 연결 <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
        </>}
        <section className="my-info-side-section">
          <h2>기술 스택</h2>
          {skillsLoading ? <div role="status" aria-label="기술 스택을 불러오는 중" className="mt-[10px] flex flex-wrap gap-[6px]"><span className="my-info-skeleton h-[30px] w-[78px]" /><span className="my-info-skeleton h-[30px] w-[88px]" /><span className="my-info-skeleton h-[30px] w-[66px]" /></div> : techStacks.length ? (
            <ul className="my-info-shared-stack-list">
              {techStacks.map(stack => (
                <TechStackChip key={stack} name={stack} />
              ))}
            </ul>
          ) : <p className="my-info-muted">등록한 기술 스택이 없어요.</p>}
        </section>
        <section className="my-info-side-section">
          <h2>관심 분야</h2>
          {profileLoading ? <div className="mt-[10px] flex gap-[6px]" aria-hidden="true"><span className="my-info-skeleton h-[26px] w-[65px]" /><span className="my-info-skeleton h-[26px] w-[80px]" /></div> : domains.length ? (
            <ul className="my-info-badges my-info-interest-list">
              {domains.map(domain => <li key={domain}>{DOMAIN_REVERSE_MAP[domain] ?? domain}</li>)}
            </ul>
          ) : <p className="my-info-muted">등록한 관심 분야가 없어요.</p>}
        </section>
      </aside>

      <div className="my-info-main">
        <div className="my-info-tabs-scroll">
          <nav ref={navRef} className="my-info-tabs" aria-label="내 프로필 메뉴">
            {tabs.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} aria-current={activePath === to ? 'page' : undefined}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            ))}
            <span ref={indicatorRef} className="my-info-tabs-indicator" aria-hidden="true" />
          </nav>
        </div>
        <div key={pathname + (tab ? '?tab=' + tab : '')} className="my-info-page-content">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
