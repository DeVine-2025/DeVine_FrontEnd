import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import ImagePreview from '@components/profileDetail/ImagePreview';
import { DOMAIN_REVERSE_MAP } from '@constants/domain';
import { useQuery } from '@tanstack/react-query';
import { Heart, Pencil } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './my-info-workspace.css';

const tabs = [
  { to: '/my-info', label: '개요' },
  { to: '/my-info?tab=projects', label: '프로젝트' },
  { to: '/my-info?tab=reports', label: '리포트' },
  { to: '/my-info/bookmark', label: '저장함' },
  { to: '/my-info/setting', label: '설정' },
];

export default function MyInfoPage() {
  const { pathname, search } = useLocation();
  const { data } = useQuery(myInfoQueries.profile());
  const profile = data?.result;
  const member = profile?.member;
  const tab = new URLSearchParams(search).get('tab');
  const activePath = pathname === '/my-info' && (tab === 'projects' || tab === 'reports')
    ? '/my-info?tab=' + tab
    : pathname;

  return (
    <section className="my-info-workspace" aria-label="내 프로필">
      <header className="my-info-hero">
        <ImagePreview isExist={Boolean(member?.imageUrl)} imageUrl={member?.imageUrl} className="my-info-avatar" alt="내 프로필 사진" />
        <div className="my-info-identity">
          <div className="my-info-name-row">
            <h1>{member?.nickname || member?.name || '내 프로필'}</h1>
            <Link className="my-info-control my-info-edit" to="/profile-edit">
              <Pencil size={14} aria-hidden="true" /> 프로필 수정
            </Link>
          </div>
          {!!profile?.domains?.length && (
            <div className="my-info-domains">
              <Heart size={16} aria-hidden="true" /> 관심 도메인
              {profile.domains.map(domain => <span key={domain}>{DOMAIN_REVERSE_MAP[domain] ?? domain}</span>)}
            </div>
          )}
          <p>{member?.body || '아직 작성한 소개가 없어요.'}</p>
        </div>
      </header>
      <nav className="my-info-tabs" aria-label="내 프로필 메뉴">
        {tabs.map(({ to, label }) => (
          <Link key={to} to={to} aria-current={activePath === to ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      <Outlet />
    </section>
  );
}
