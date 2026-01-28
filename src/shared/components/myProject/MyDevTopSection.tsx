import ProjectLg from '@components/common/ProjectLg';
import Tabs from '@components/tab/CommonTabs';
import { PROJECT_LIST, PROJECT_ROLES } from 'src/mocks/project.mock';

export type DevTab = 'suggested' | 'applied';

type Props = {
  devTab: DevTab;
  onChangeDevTab: (tab: DevTab) => void;
};

const MyDevTopSection = ({ devTab, onChangeDevTab }: Props) => {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <Tabs<DevTab>
          value={devTab}
          onChange={onChangeDevTab}
          items={[
            { value: 'suggested', label: '받은 제안' },
            { value: 'applied', label: '지원 중' },
          ]}
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {PROJECT_LIST.map((p) => (
          <ProjectLg
            key={p.id}
            {...p}
            roles={[...PROJECT_ROLES]}
            showBookmark={false}
            showDue={false}
            action={
              <div className="flex gap-3">
                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-[#4E49FF] px-3 py-2 font-medium text-[12px] text-my-tab-inactive"
                  onClick={() => console.log('수락', p.id)}
                >
                  수락하기
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-surface-tab px-3 py-2 font-medium text-[12px] text-my-tab-text"
                  onClick={() => console.log('거절', p.id)}
                >
                  거절하기
                </button>
              </div>
            }
            onClick={() => console.log('click project', p.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default MyDevTopSection;
