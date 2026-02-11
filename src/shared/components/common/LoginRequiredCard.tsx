import { Link } from 'react-router-dom';

interface LoginRequiredCardProps {
  /** 카드 제목 (기본: 로그인이 필요해요) */
  title?: string;
  /** 설명 문구 (예: 추천 프로젝트를 보려면 로그인해 주세요.) */
  description: string;
  /** 카드 크기 (기본: lg) */
  size?: 'sm' | 'lg';
}

const LoginRequiredCard = ({
  title = '로그인이 필요해요',
  description,
  size = 'lg',
}: LoginRequiredCardProps) => {
  const isSmall = size === 'sm';

  return (
    <div
      className={`flex flex-col items-start rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] text-left ${
        isSmall ? 'w-[320px] gap-5 p-8' : 'h-[210px] w-[400px] gap-7 p-11'
      }`}
    >
      <div className={`flex flex-col ${isSmall ? 'gap-1.5' : 'gap-2'}`}>
        <span
          className={`font-semibold text-[var(--ui-900)] ${isSmall ? 'text-[17px]' : 'text-[21px]'}`}
        >
          {title}
        </span>
        <span className={`text-[var(--ui-500)] ${isSmall ? 'text-[13px]' : 'text-[15px]'}`}>
          {description}
        </span>
      </div>
      <Link
        to="/login"
        className={`inline-flex w-full items-center justify-center rounded-2xl bg-[#4E49FF] font-semibold text-white ${
          isSmall ? 'h-[40px] text-[15px]' : 'h-[52px] text-[18px]'
        }`}
      >
        로그인하기
      </Link>
    </div>
  );
};

export default LoginRequiredCard;
