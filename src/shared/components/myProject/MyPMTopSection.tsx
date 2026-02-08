import ProfileCard from '@components/common/ProfileCard';
import Tabs from '@components/tab/CommonTabs';
import { PROFILE_CARD_LIST } from 'src/mocks/developer.mock';

export type DevTab = 'suggested' | 'applied';

type Props = {
  devTab: DevTab;
  onChangeDevTab: (tab: DevTab) => void;
};

const MyPMTopSection = ({ devTab, onChangeDevTab }: Props) => {
  return (
    <section>
      <div className="flex items-center justify-between">
        <Tabs<DevTab>
          value={devTab}
          onChange={onChangeDevTab}
          items={[
            { value: 'suggested', label: '제안한 개발자' },
            { value: 'applied', label: '개발자 지원 현황' },
          ]}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {PROFILE_CARD_LIST.map((profile) => (
          <ProfileCard
            key={profile.id}
            {...profile}
            size="lg"
            action={
              <div className="flex gap-3">
                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-[#4E49FF] px-3 py-2 font-medium text-[12px] text-my-tab-inactive"
                  onClick={() => console.log('수락', profile.id)}
                >
                  수락하기
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-surface-tab px-3 py-2 font-medium text-[12px] text-my-tab-text"
                  onClick={() => console.log('거절', profile.id)}
                >
                  거절하기
                </button>
              </div>
            }
          />
        ))}
      </div>
    </section>
  );
};

export default MyPMTopSection;
