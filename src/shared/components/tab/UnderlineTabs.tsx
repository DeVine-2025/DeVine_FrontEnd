import { useElasticUnderline } from '@hooks/useElasticUnderline';
import type { ReactNode } from 'react';
import './underline-tabs.css';

type UnderlineTabsProps<T extends string> = {
  label: string;
  value: T;
  items: readonly { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  className?: string;
};

export default function UnderlineTabs<T extends string>({
  label,
  value,
  items,
  onChange,
  className,
}: UnderlineTabsProps<T>) {
  const { navRef, indicatorRef } = useElasticUnderline(value, 'button[aria-pressed="true"]');

  return (
    <nav ref={navRef} className={className ? `explore-tabs ${className}` : 'explore-tabs'} aria-label={label}>
      {items.map((item) => (
        <button key={item.value} type="button" aria-pressed={value === item.value} onClick={() => onChange(item.value)}>
          {item.label}
        </button>
      ))}
      <span ref={indicatorRef} className="explore-tabs-indicator" aria-hidden="true" />
    </nav>
  );
}
