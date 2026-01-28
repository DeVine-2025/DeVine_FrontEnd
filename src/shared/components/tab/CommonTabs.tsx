type TabItem<T extends string> = { value: T; label: string };

export default function CommonTabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: TabItem<T>[];
}) {
  return (
    <div className="flex gap-4">
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={[
              'rounded-full border px-6 py-2.5 font-medium text-[13px] transition',
              active
                ? 'bg-my-tab-active text-tab-bg-active'
                : 'border-my-tab-border bg-my-tab-inactive text-my-tab-text',
            ].join(' ')}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
