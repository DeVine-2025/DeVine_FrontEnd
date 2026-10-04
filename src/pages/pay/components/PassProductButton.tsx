type PassProductButtonProps = {
  unitCount: 1 | 3;
  unitPrice: number;
  selected: boolean;
  onClick: (unitCount: 1 | 3) => void;
};

const formatWon = (value: number) => `${value.toLocaleString('ko-KR')}원`;

const PassProductButton = ({ unitCount, unitPrice, selected, onClick }: PassProductButtonProps) => {
  const unitPriceForOne = Math.round(unitPrice / unitCount);
  const savings = unitCount === 3 ? 4_900 * 3 - unitPrice : 0;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onClick(unitCount)}
      className={`flex w-full items-center gap-[1.4rem] rounded-[1.2rem] border px-[1.6rem] py-[1.5rem] text-left transition-colors ${
        selected
          ? 'border-[#B49AFF] bg-[rgba(112,85,245,0.08)]'
          : 'border-card-border bg-transparent hover:bg-[rgba(255,255,255,0.025)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-[2.4rem] shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-[#A88AFF]' : 'border-[var(--ui-500)]'
        }`}
      >
        {selected ? <span className="size-[1.2rem] rounded-full bg-[#A88AFF]" /> : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center justify-between gap-[1rem]">
          <span className="text-[1.6rem] font-semibold text-card-title">
            {unitCount}회 이용권
          </span>
          <span className={`shrink-0 text-[1.7rem] font-bold ${selected ? 'text-[#B49AFF]' : 'text-card-title'}`}>
            {formatWon(unitPrice)}
          </span>
        </span>
        <span className="mt-[0.4rem] text-[1.2rem] text-[var(--ui-500)]">
          {unitCount === 3
            ? `1회당 ${formatWon(unitPriceForOne)} · ${formatWon(savings)} 절약`
            : '필요할 때 한 번 이용할 수 있어요.'}
        </span>
      </span>
    </button>
  );
};

export default PassProductButton;
