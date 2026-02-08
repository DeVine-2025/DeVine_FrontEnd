import CancelIcon from "@assets/icons/cancel.svg?react";

const stackIconByName: Record<string, string> = {
  JavaScript: 'https://skillicons.dev/icons?i=js',
  TypeScript: 'https://skillicons.dev/icons?i=ts',
  React: 'https://skillicons.dev/icons?i=react',
  Vuejs: 'https://skillicons.dev/icons?i=vue',
  Nextjs: 'https://skillicons.dev/icons?i=nextjs',
  Svelte: 'https://skillicons.dev/icons?i=svelte',
  ReactNative: 'https://skillicons.dev/icons?i=react',
  Flutter: 'https://skillicons.dev/icons?i=flutter',
  Kotlin: 'https://skillicons.dev/icons?i=kotlin',
  Swift: 'https://skillicons.dev/icons?i=swift',
  Java: 'https://skillicons.dev/icons?i=java',
  Python: 'https://skillicons.dev/icons?i=python',
  C: 'https://skillicons.dev/icons?i=c',
  'C++': 'https://skillicons.dev/icons?i=cpp',
  Php: 'https://skillicons.dev/icons?i=php',
  Springboot: 'https://skillicons.dev/icons?i=spring',
  Nodejs: 'https://skillicons.dev/icons?i=nodejs',
  Express: 'https://skillicons.dev/icons?i=express',
  Nestjs: 'https://skillicons.dev/icons?i=nestjs',
  Django: 'https://skillicons.dev/icons?i=django',
  MongoDB: 'https://skillicons.dev/icons?i=mongodb',
  MySQL: 'https://skillicons.dev/icons?i=mysql',
  AWS: 'https://skillicons.dev/icons?i=aws',
  Firebase: 'https://skillicons.dev/icons?i=firebase',
  Docker: 'https://skillicons.dev/icons?i=docker',
  Kubernetes: 'https://skillicons.dev/icons?i=kubernetes',
};

type StackChipsProps = {
  stacks: string[];
  onRemove?: (stack: string) => void;
};

const StackChips = ({ stacks, onRemove }: StackChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {stacks.map((stack) => {
        const iconSrc = stackIconByName[stack];

        return (
          <div
            key={stack}
            className="flex items-center gap-[0.8rem] rounded-full bg-ui-100 border border-ui-200 px-[1.2rem] py-[0.8rem]"
          >
            {iconSrc && (
              <img
                src={iconSrc}
                alt={`${stack} 로고`}
                className="h-5 w-5"
                loading="lazy"
              />
            )}

            <span className="text-l font-semibold text-ui-800">
              {stack}
            </span>

            <button
              type="button"
              onClick={() => onRemove?.(stack)}
              className="flex items-center justify-center rounded-full hover:bg-[var(--ui-200)]"
            >
              <CancelIcon className="h-3 w-3 text-badge-text-gray" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default StackChips;
