import LockCloseIcon from "@assets/icons/lock-close.svg?react";
import LockOpenIcon from "@assets/icons/lock-open.svg?react";
import PlusIcon from "@assets/icons/plus.svg?react";
import {cn} from "@libs/cn";
import { useState } from 'react';

type ReportCardProps = {
  type: 'create' | 'main';
  label?: string;
  title?: string;
  description?: string;
  onClickCreate?: () => void;
  onClickShowDetails?: () => void;
  onClickLock?: () => void;
}
const ReportCard = ({type, label, title, description} : ReportCardProps) => {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="inline-flex rounded-3xl border border-[var(--ui-200)] p-[3.2rem] h-[29.8rem] cursor-pointer">
      <div className="w-[24.2rem]">
        {type === 'create' &&
          <div className="cursor-pointer w-full h-full flex items-center justify-center">
            <div className="flex-col-center gap-[3.3rem]">
              <PlusIcon className="w-[6rem] h-[6rem]" />
              <p className="Title3 text-[var(--ui-400)]">리포트 생성하기</p>
            </div>
          </div>}
        {type === 'main' && <div>
          <div className="flex justify-between ">
            <div className="py-[0.4rem] px-[0.8rem] bg-[var(--badge-bg-primary)] rounded-lg flex-col-center">
              <p className="Label1 text-[var(--badge-text-primary)]">{label}</p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsOn((prev) => !prev)}
                className={cn('relative w-[5.6rem] h-[2.8rem] rounded-[80px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[0.8rem]' ,isOn && "bg-primary")}
              >
                <div className="flex h-full items-center justify-between">
                  <LockOpenIcon
                    className='text-[#F3F5FC]'
                  />
                  <LockCloseIcon
                    className={cn(
                      'transition-colors',
                      isOn ? 'text-[#F3F5FC]' : 'text-[var(--ui-300)]'
                    )}
                  />
                </div>

                <div
                  className={cn(
                    'absolute left-[0.2rem] top-1/2 h-[2.4rem] w-[2.6rem] -translate-y-1/2 rounded-full border border-[var(--ui-200)] bg-[var(--ui-bg)] transition-transform duration-200 ease-out',
                    isOn && 'translate-x-[2.4rem]'
                  )}
                />
              </button>
            </div>
          </div>
          <p className="Heading1 font-semibold line-clamp-2 mt-[2rem] text-[var(--ui-1000)]">{title}</p>
          <p className="Body1 mt-[1.6rem] line-clamp-4  text-[var(--ui-400)]">{description}</p>

        </div>}
      </div>

    </div>
  );
};

export default ReportCard;