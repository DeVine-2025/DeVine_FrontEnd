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
            categoryLabel={p.categoryLabel}
            deadlineLabel={p.deadlineLabel}
            title={p.title}
            location={p.location}
            period={p.period}
            mode={p.mode}
            roles={[...PROJECT_ROLES]}
            dueLabel={p.dueLabel}
            bookmarked={p.bookmarked}
            onBookmarkChange={(next) => console.log('bookmark', p.id, next)}
            onClick={() => console.log('click project', p.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default MyDevTopSection;
