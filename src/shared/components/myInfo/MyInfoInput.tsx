import SearchIcon from '@assets/icons/search.svg?react';
import { cn } from '@libs/cn';

type MyInfoInputProps = {
  type: 'text' | 'search';
  text?: string;
  setText?: (text: string) => void;
  onClick?: () => void;
  placeholder?: string;
};

const MyInfoInput = ({ type, text, setText, placeholder, onClick }: MyInfoInputProps) => {
  return (
    <div className="relative">
      {type === 'search' && (
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-[1.4rem] h-8 w-8 text-ui-400" />
      )}
      <input
        type={type}
        onClick={onClick}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-2xl bg-ui-50 p-[1.4rem] text-ui-1000 text-xl placeholder:text-ui-400',
          type === 'search' && 'cursor-pointer pl-[5rem]',
        )}
        value={text}
        onChange={(e) => setText?.(e.target.value)}
      />
    </div>
  );
};

export default MyInfoInput;
