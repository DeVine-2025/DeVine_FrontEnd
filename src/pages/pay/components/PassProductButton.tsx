type PassProductButtonProps = {
  unitCount: 1 | 3;
  unitPrice: number;
  selected: boolean;
  onClick: (unitCount: 1 | 3) => void;
};

const formatWon = (value: number) => `${value.toLocaleString('ko-KR')}원`;
const PASS_PRODUCT_LABEL = '리포트 생성권';
const PASS_PRODUCT_DESCRIPTION = '설명이 들어가는 자리입니다.';

const PassProductButton = ({ unitCount, unitPrice, selected, onClick }: PassProductButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(unitCount)}
      className={`h-[176px] w-[250px] cursor-pointer rounded-3xl border p-8 text-left ${
        selected
          ? 'border-[var(--color-primary)]'
          : 'border-ui-200 bg-ui-bg'
      }`}
    >
      <p className="Headline1 leading-6 font-semibold text-card-title">{PASS_PRODUCT_LABEL}</p>
      <p className="mt-2 Title3 leading-10 font-bold text-card-title">{`${unitCount}개`}</p>
      <p className="mt-2 text-right Title3 leading-10 font-bold text-card-title">
        {formatWon(unitPrice)}
      </p>
      <p className="mt-4 text-right Caption1 leading-4 font-semibold text-card-muted">
        {PASS_PRODUCT_DESCRIPTION}
      </p>
    </button>
  );
};

export default PassProductButton;
