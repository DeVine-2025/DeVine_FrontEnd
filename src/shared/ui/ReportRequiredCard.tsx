import { Link } from 'react-router-dom';

interface ReportRequiredCardProps {
  /** 카드 제목 (기본: 리포트를 생성하면 맞춤 추천을 받을 수 있어요) */
  title?: string;
  /** 설명 문구 (기본: 나에게 맞는 추천 프로젝트를 받아 보세요) */
  description?: string;
  /** 버튼 텍스트 (기본: 리포트 생성 페이지로 이동) */
  linkLabel?: string;
  /** 이동할 경로 (기본: /report/create) */
  linkTo?: string;
  /** 카드 크기 (기본: lg) */
  size?: 'sm' | 'lg';
}

const ReportRequiredCard = ({
  title = '리포트를 생성하면 맞춤 추천을 받을 수 있어요',
  description = '나에게 맞는 추천 프로젝트를 받아 보세요',
  linkLabel = '리포트 생성 페이지로 이동',
  linkTo = '/report/create',
  size = 'lg',
}: ReportRequiredCardProps) => {
  const isSmall = size === 'sm';

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] text-center shadow-none ${
        isSmall ? 'w-[400px] gap-6 px-10 py-8' : 'w-[520px] gap-10 px-16 py-14'
      }`}
    >
      <div className={`flex flex-col items-center ${isSmall ? 'gap-2' : 'gap-3'}`}>
        <span
          className={`whitespace-nowrap font-semibold text-[var(--ui-900)] ${
            isSmall ? 'text-[17px]' : 'text-[21px]'
          }`}
        >
          {title}
        </span>
        <span className={`text-[var(--ui-500)] ${isSmall ? 'text-[13px]' : 'text-[15px]'}`}>
          {description}
        </span>
      </div>
      <Link
        to={linkTo}
        className={`inline-flex w-full items-center justify-center rounded-2xl bg-[#4E49FF] font-semibold text-white ${
          isSmall ? 'h-[40px] max-w-[260px] text-[15px]' : 'h-[52px] max-w-[320px] text-[18px]'
        }`}
      >
        {linkLabel}
      </Link>
    </div>
  );
};

export default ReportRequiredCard;
