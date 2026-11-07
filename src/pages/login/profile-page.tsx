import { useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getCategoryIdsByLabels } from '@constants/signup-mapping';
import { useAuthStore } from '@store/auth';
import { getStoredUserRole } from '@utils/storage';
import { ArrowLeft, BriefcaseBusiness, Code2, CreditCard, Gamepad2, GraduationCap, HeartPulse, Layers, ShoppingCart, UsersRound } from 'lucide-react';

type ProfilePageProps = {
  onBack: () => void;
  onNext: (data: { mainType: 'PM' | 'DEVELOPER'; categoryIds: number[]; domainLabels: string[] }) => void;
  initialRole?: 'pm' | 'dev' | null;
  initialDomains?: string[];
  preview?: boolean;
};

const roleOptions = [
  { key: 'pm', label: 'PM', icon: BriefcaseBusiness },
  { key: 'dev', label: '개발자', icon: Code2 },
] as const;

// 프로필 편집 화면에서 사용하는 도메인 아이콘과 동일하게 유지합니다.
const domainOptions = [
  { label: '교육', icon: GraduationCap },
  { label: '헬스케어', icon: HeartPulse },
  { label: '소셜/커뮤니티', icon: UsersRound },
  { label: '핀테크', icon: CreditCard },
  { label: '엔터테인먼트', icon: Gamepad2 },
  { label: '이커머스', icon: ShoppingCart },
  { label: 'AI/데이터', icon: Layers },
];

const ProfilePage = ({ onBack, onNext, initialRole = null, initialDomains = [], preview = false }: ProfilePageProps) => {
  const setAuthRole = useAuthStore((state) => state.setRole);
  const { user } = useUser();
  const storedRole = getStoredUserRole(user?.id ?? null) as 'pm' | 'dev' | null;
  const [role, setRole] = useState<'pm' | 'dev' | null>(initialRole ?? storedRole ?? 'pm');
  const [domains, setDomains] = useState<string[]>(initialDomains);
  const canProceed = useMemo(() => role !== null && domains.length > 0, [role, domains]);

  const handleNext = () => {
    if (role && !preview) setAuthRole(role);
    onNext({ mainType: role === 'dev' ? 'DEVELOPER' : 'PM', categoryIds: getCategoryIdsByLabels(domains), domainLabels: domains });
  };
  const toggleDomain = (value: string) => setDomains((previous) => {
    if (previous.includes(value)) return previous.filter((item) => item !== value);
    return previous.length >= 3 ? previous : [...previous, value];
  });
  const handleRoleChange = (nextRole: 'pm' | 'dev') => {
    setRole(nextRole);
    if (!preview) setAuthRole(nextRole);
  };

  return (
    <div className="mx-auto w-full max-w-[515px] text-[#f5f5f7]">
      <h2 className="text-[clamp(26px,3vw,36px)] font-bold leading-[1.3] tracking-[-.04em]">활동 정보 설정</h2>
      <p className="mt-4 text-[16px] leading-[1.6] text-[#b5b7c8]">주요 역할과 관심 분야를 선택해 주세요.</p>
      <div className="mt-12 flex flex-col gap-12">
        <fieldset>
          <legend className="text-[16px] font-semibold text-[#f0f0f5]">주요 역할 <span className="text-[var(--project-accent)]" aria-hidden="true">*</span></legend>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {roleOptions.map(({ key, label, icon: Icon }) => {
              const selected = role === key;
              return <button key={key} type="button" onClick={() => handleRoleChange(key)} aria-pressed={selected} className={`flex min-h-[56px] items-center gap-3 rounded-[10px] border px-4 text-left text-[15px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-accent)] ${selected ? 'border-[var(--project-accent)] bg-[#a69bff]/10 text-[#d4cbff]' : 'border-white/[0.12] bg-transparent text-[#c4c5d1] hover:border-white/30'}`}><Icon size={19} aria-hidden="true" />{label}</button>;
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="w-full text-[16px] font-semibold text-[#f0f0f5]"><span className="flex w-full items-center justify-between"><span>관심 도메인</span><span className="text-[13px] font-normal text-[#a9abc0]" aria-live="polite"><span className="text-[var(--project-accent)]">{domains.length}</span> / 3</span></span></legend>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {domainOptions.map(({ label, icon: Icon }) => {
              const selected = domains.includes(label);
              return <button key={label} type="button" onClick={() => toggleDomain(label)} aria-pressed={selected} className={`flex min-h-[50px] items-center gap-2.5 rounded-[10px] border px-3 text-left text-[14px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-accent)] ${selected ? 'border-[var(--project-accent)] bg-[#a69bff]/10 text-[#d4cbff]' : 'border-white/[0.12] bg-transparent text-[#c4c5d1] hover:border-white/30'}`}><Icon size={17} className="shrink-0" aria-hidden="true" /><span>{label}</span></button>;
            })}
          </div>
        </fieldset>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <button type="button" disabled={!canProceed} onClick={handleNext} className={`h-[52px] w-full rounded-[10px] border text-[15px] font-semibold tracking-[-.01em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--project-accent)] ${canProceed ? 'cursor-pointer border-transparent bg-[var(--project-accent)] text-[#191824] hover:bg-[color-mix(in_srgb,var(--project-accent)_85%,white)]' : 'cursor-not-allowed border-white/[0.10] bg-white/[0.035] text-[#8f92a3]'}`}>다음</button>
        <button type="button" onClick={onBack} className="inline-flex w-fit items-center self-center gap-2 text-[14px] text-[#a9abc0] transition-colors hover:text-[#f5f5f7]"><ArrowLeft size={17} aria-hidden="true" />돌아가기</button>
      </div>
    </div>
  );
};

export default ProfilePage;
