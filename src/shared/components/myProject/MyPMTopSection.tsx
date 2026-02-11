import ProfileCard from '@components/common/ProfileCard';
import Tabs from '@components/tab/CommonTabs';
import { type DevTab, type MatchingDeveloper, usePmDevelopers } from '@hooks/usePmDevelopers';
import type { ProfileCardProps, TechStackItem } from '@t/profileCard.types';

type Props = {
  devTab: DevTab;
  onChangeDevTab: (tab: DevTab) => void;
};

function mapBadges(categories: MatchingDeveloper['categories']) {
  return categories.map((c, idx) => ({
    id: `${c.genre}-${idx}`,
    label: c.displayName,
    tone: 'blue' as const,
  }));
}

function mapTechStacks(stacks: string[]): TechStackItem[] {
  return stacks.map((name) => ({
    id: name,
    name,
  }));
}

function toProfileCardProps(d: MatchingDeveloper): ProfileCardProps {
  return {
    id: String(d.developerId),

    role: d.partName,
    roleTone: 'green',

    nickname: d.developerNickname,

    profileImageUrl: d.developerImageUrl ?? '/images/default-profile.png',

    introduction: d.body ?? '한줄 소개가 들어가는 자리입니다.',

    badges: mapBadges(d.categories),

    techStack: mapTechStacks(d.techStacks),

    size: 'lg',
  };
}

function getEmptyMessage(tab: DevTab) {
  return tab === 'suggested' ? '제안한 개발자가 없어요.' : '지원한 개발자가 없어요.';
}

const Header = ({ projectName }: { projectName: string }) => (
  <div>
    <p className="text-badge-text-primary text-xl">프로젝트</p>
    <h3 className="font-bold text-ui-900 text-xl">{projectName}</h3>
    <div className="my-4 h-px w-full bg-[var(--ui-100)]" />
  </div>
);

const Action = ({
  visible,
  onAccept,
  onReject,
}: {
  visible: boolean;
  onAccept: () => void;
  onReject: () => void;
}) => {
  if (!visible) return null;

  return (
    <div className="flex gap-4">
      <button
        type="button"
        className="cursor-pointer rounded-xl bg-[#4E49FF] px-4 py-3 font-medium text-[13px] text-my-tab-inactive"
        onClick={onAccept}
      >
        수락하기
      </button>

      <button
        type="button"
        className="cursor-pointer rounded-xl bg-surface-tab px-4 py-3 font-medium text-[13px] text-my-tab-text"
        onClick={onReject}
      >
        거절하기
      </button>
    </div>
  );
};

const MyPMTopSection = ({ devTab, onChangeDevTab }: Props) => {
  const { data, isLoading, isError } = usePmDevelopers(devTab);

  const suggestedQ = usePmDevelopers('suggested');
  const appliedQ = usePmDevelopers('applied');

  const suggestedCount = suggestedQ.data?.totalElements ?? 0;
  const appliedCount = appliedQ.data?.totalElements ?? 0;

  const tabLabel = (text: string, count: number) => (
    <div className="flex items-center gap-3">
      <span>{text}</span>
      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/20 px-2 text-sm">
        {count}
      </span>
    </div>
  );

  return (
    <section>
      <div className="flex items-center justify-between">
        <Tabs<DevTab>
          value={devTab}
          onChange={onChangeDevTab}
          items={[
            { value: 'suggested', label: tabLabel('제안한 개발자', suggestedCount) },
            { value: 'applied', label: tabLabel('개발자 지원 현황', appliedCount) },
          ]}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {isLoading && <div className="py-10 text-center">로딩중...</div>}
        {isError && <div className="py-10 text-center">불러오기에 실패했어요.</div>}

        {!isLoading && !isError && (data?.content?.length ?? 0) === 0 && (
          <div className="py-30 text-center text-3xl text-card-muted">
            {getEmptyMessage(devTab)}
          </div>
        )}

        {!isLoading &&
          !isError &&
          (data?.content ?? []).map((d) => {
            const cardProps = toProfileCardProps(d);

            return (
              <ProfileCard
                key={d.matchingId}
                {...cardProps}
                header={<Header projectName={d.projectName} />}
                action={
                  devTab === 'suggested' ? (
                    <Action
                      visible
                      onAccept={() => console.log('수락', d.matchingId)}
                      onReject={() => console.log('거절', d.matchingId)}
                    />
                  ) : d.decision === 'PENDING' ? (
                    <div className="rounded-xl bg-gray-100 px-4 py-3 font-medium text-[13px] text-gray-500">
                      응답 대기 중
                    </div>
                  ) : d.decision === 'ACCEPT' ? (
                    <div className="rounded-xl bg-green-100 px-4 py-3 font-medium text-[13px] text-green-600">
                      수락됨
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-100 px-4 py-3 font-medium text-[13px] text-red-600">
                      거절됨
                    </div>
                  )
                }
              />
            );
          })}
      </div>
    </section>
  );
};

export default MyPMTopSection;
export type { DevTab };
