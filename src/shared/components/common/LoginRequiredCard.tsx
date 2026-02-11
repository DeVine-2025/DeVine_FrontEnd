import { Link } from 'react-router-dom';

interface LoginRequiredCardProps {
  /** 카드 제목 (기본: 로그인이 필요해요) */
  title?: string;
  /** 설명 문구 (예: 추천 프로젝트를 보려면 로그인해 주세요.) */
  description: string;
}

const LoginRequiredCard = ({
  title = '로그인이 필요해요',
  description,
}: LoginRequiredCardProps) => {
  return (
    <div className="flex h-[210px] w-[400px] flex-col items-start gap-7 rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] p-11 text-left">
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-[21px] text-[var(--ui-900)]">{title}</span>
        <span className="text-[15px] text-[var(--ui-500)]">{description}</span>
      </div>
      <Link
        to="/login"
        className="inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#4E49FF] font-semibold text-[18px] text-white"
      >
        로그인하기
      </Link>
    </div>
  );
};

export default LoginRequiredCard;
