import SearchIcon from '@assets/icons/search.svg?react';

import { cn } from '@libs/cn';

type MyInfoInputProps = {
  type: 'text' | 'search',
  text?: string,
  setText?: (text: string) => void,
  onClick?: () => void,
  placeholder?: string
}

const MyInfoInput = ({ type, text, setText, placeholder, onClick }: MyInfoInputProps) => {
  return (
    <div className="relative">
      {type === 'search' &&
        <SearchIcon className="text-ui-400 absolute w-8 h-8 left-[1.4rem]  top-1/2 -translate-y-1/2" />}
      <input
        type={type}
        onClick={onClick}
        placeholder={placeholder}
        className={cn(
          'w-full bg-ui-50 p-[1.4rem] rounded-2xl text-ui-1000 text-lg placeholder:text-ui-400',
          type === 'search' && 'cursor-pointer pl-[5rem]'
        )}
        value={text}
        onChange={(e) => setText?.(e.target.value)}
      />

    </div>
  );
};

export default MyInfoInput;