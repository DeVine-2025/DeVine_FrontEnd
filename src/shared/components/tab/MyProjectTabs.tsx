import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { BriefcaseBusiness, CodeXml } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export default function MyProjectTabs() {
  const { pathname } = useLocation();
  const { navRef, indicatorRef } = useElasticUnderline(pathname);
  const links = [
    { path: 'pm', label: 'PM', Icon: BriefcaseBusiness },
    { path: 'dev', label: '개발자', Icon: CodeXml },
  ];

  return <nav ref={navRef} aria-label="지원 현황 역할" className="relative flex gap-8 border-b border-[var(--project-divider)]">
    {links.map(({ path, label, Icon }) => <NavLink key={path} to={path}
      className={({ isActive }) => `inline-flex min-h-[48px] items-center gap-2 px-1 text-[14px] font-semibold transition-colors hover:text-[var(--text-main)] ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-secondary)]'}`}>
      <Icon size={16} aria-hidden="true" />{label}
    </NavLink>)}
    <span ref={indicatorRef} aria-hidden="true" className="pointer-events-none invisible absolute bottom-[-1px] left-0 h-[2px] rounded-full bg-[var(--project-accent)]" />
  </nav>;
}
