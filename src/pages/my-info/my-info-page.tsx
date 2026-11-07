import { isTechnologySkill } from '@apis/techstacks';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import GithubIcon from '@assets/icons/github.svg?react';
import { useUser } from '@clerk/clerk-react';
import { ExploreTechIcon, getTechDisplayName } from '@components/cards/TechStackBadges';
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
  const { data } = useQuery(myInfoQueries.profile());
  const { data: skills } = useQuery(myInfoQueries.getMyTechStacks());
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
    <section className="my-info-workspace" aria-label="내 프로필">
      <aside className="my-info-hero" aria-label="프로필 정보">
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
        <section className="my-info-side-section">
          <h2>기술 스택</h2>
          {techStacks.length ? (
            <ul className="my-info-badges my-info-stack-list">
              {techStacks.map(stack => (
                <li key={stack}><ExploreTechIcon name={stack} />{stack}</li>
              ))}
            </ul>
          ) : <p className="my-info-muted">등록한 기술 스택이 없어요.</p>}
        </section>
        <section className="my-info-side-section">
          <h2>관심 분야</h2>
          {domains.length ? (
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
