type TabMenuProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

const TabMenu = ({ activeTab, setActiveTab, tabs }: TabMenuProps) => {
  const baseTabClass = 'cursor-pointer rounded-xl py-3 text-2xl text-center font-semibold transition-colors';
  const activeClass = 'bg-tab-bg-active text-tab-text-active';
  const inactiveClass = 'text-tab-text-inactive hover:text-tab-text-active';

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-[276px] rounded-2xl bg-surface-tab p-2">
      <div className="grid grid-cols-2 gap-2">
        {tabs.map((tab) => (
          <p
            key={tab}
            className={`${baseTabClass} ${activeTab === tab ? activeClass : inactiveClass}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </p>
        ))}
      </div>
    </div>
  );
};

export default TabMenu;