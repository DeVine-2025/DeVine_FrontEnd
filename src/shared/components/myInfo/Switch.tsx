import { cn } from '@libs/cn';

type SwitchProps = {
  isOn: boolean;
  setIsOn: (p: (prev: any) => boolean) => void;
}

const Switch = ({isOn, setIsOn} : SwitchProps) => {
  return (
    <div className={cn('flex gap-[1.6rem] p-[1.2rem]')}>
      <button
        type="button"
        onClick={() => setIsOn((prev) => !prev)}
        className={cn(
          'relative h-[2.8rem] w-[5.6rem] rounded-[80px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[0.8rem]',
          isOn && 'bg-primary',
        )}
      >
        <div
          className={cn(
            '-translate-y-1/2 absolute top-1/2 left-[0.2rem] h-[2.4rem] w-[2.6rem] rounded-full border border-[var(--ui-200)] bg-[var(--ui-bg)] transition-transform duration-200 ease-out',
            isOn && 'translate-x-[2.4rem]',
          )}
        />
      </button>
    </div>
  );
};

export default Switch;