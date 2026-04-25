import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';

type QuantityStepperProps = {
  value: number;
  min: number;
  max: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

const iconClassName = 'h-[8px] w-[8px] text-[var(--ui-1000)] [&_path]:!stroke-[var(--ui-1000)]';

const QuantityStepper = ({ value, min, max, onDecrease, onIncrease }: QuantityStepperProps) => {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className="inline-flex h-14 w-[108px] items-center overflow-hidden rounded-2xl border border-card-border bg-card-bg">
      <span className="Body1 flex h-full flex-1 items-center pl-5 font-semibold text-card-title">
        {value}
      </span>

      <div className="flex h-full w-11 flex-col justify-center">
        <button
          type="button"
          onClick={onIncrease}
          disabled={!canIncrease}
          className={`flex h-[30%] w-full items-center justify-end pr-5 ${
            canIncrease ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
          }`}
          aria-label="이용권 수 증가"
        >
          <ChevronDownIcon className={`${iconClassName} rotate-180`} />
        </button>

        <button
          type="button"
          onClick={onDecrease}
          disabled={!canDecrease}
          className={`flex h-[30%] w-full items-center justify-end pr-5 ${
            canDecrease ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
          }`}
          aria-label="이용권 수 감소"
        >
          <ChevronDownIcon className={iconClassName} />
        </button>
      </div>
    </div>
  );
};

export default QuantityStepper;
