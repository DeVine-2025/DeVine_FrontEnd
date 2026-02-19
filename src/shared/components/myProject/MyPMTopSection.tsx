import ProfileCard from '@components/common/ProfileCard';
import Tabs from '@components/tab/CommonTabs';
import { type DevTab, type MatchingDeveloper, usePmDevelopers } from '@hooks/usePmDevelopers';
import { useRespondApplication } from '@hooks/useRespondApplication';
import { useThemeStore } from '@store/theme';
import type { ProfileCardProps, TechStackItem } from '@t/profileCard.types';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDefaultLight from '@assets/images/Profile.svg?url';
import ProfileDefaultDark from '@assets/images/Profile_dark.svg?url';

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

function toProfileCardProps(d: MatchingDeveloper, defaultProfileUrl: string): ProfileCardProps {
  return {
    id: String(d.developerId),
    role: d.partName,
    roleTone: 'green',
    nickname: d.developerNickname,
    profileImageUrl: d.developerImageUrl?.trim() || defaultProfileUrl,
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
  disabled,
}: {
  visible: boolean;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}) => {
  if (!visible) return null;

  return (
    <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={disabled}
        className="cursor-pointer rounded-xl bg-[#4E49FF] px-4 py-3 font-medium text-[13px] text-my-tab-inactive disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onAccept}
      >
        수락하기
      </button>

      <button
        type="button"
        disabled={disabled}
        className="cursor-pointer rounded-xl bg-surface-tab px-4 py-3 font-medium text-[13px] text-my-tab-text disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onReject}
      >
        거절하기
      </button>
    </div>
  );
};

const MyPMTopSection = ({ devTab, onChangeDevTab }: Props) => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const defaultProfileUrl = useMemo(
    () => (theme === 'dark' ? ProfileDefaultDark : ProfileDefaultLight),
    [theme],
  );
  const { data, isLoading, isError } = usePmDevelopers(devTab);
  const respondMut = useRespondApplication();

  const [localDecision, setLocalDecision] = useState<
    Record<number, 'PENDING' | 'ACCEPT' | 'REJECT'>
  >({});

  const getDecision = (matchingId: number, serverDecision: 'PENDING' | 'ACCEPT' | 'REJECT') =>
    localDecision[matchingId] ?? serverDecision;

  const suggestedQ = usePmDevelopers('suggested');
  const appliedQ = usePmDevelopers('applied');

  const suggestedCount = suggestedQ.data?.totalElements ?? 0;
  const appliedCount = appliedQ.data?.totalElements ?? 0;

  const tabLabel = (text: string, count: number) => (
    <div className="flex items-center gap-3">
      <span className="text-2xl text-ui-300 dark:text-ui-100">{text}</span>
      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--ui-200)] px-2 font-medium text-[var(--ui-800)] text-sm dark:bg-[var(--ui-700)] dark:text-[var(--ui-100)]">
        {count}
      </span>
    </div>
  );

  const renderDecisionBadge = (decision: 'PENDING' | 'ACCEPT' | 'REJECT') => {
    if (decision === 'PENDING') {
      return (
        <div className="rounded-xl bg-gray-100 px-4 py-3 font-medium text-[12px] text-gray-500">
          응답 대기 중
        </div>
      );
    }
    if (decision === 'ACCEPT') {
      return (
        <div className="rounded-xl bg-green-100 px-4 py-3 font-medium text-[12px] text-green-600">
          수락 완료
        </div>
      );
    }
    return (
      <div className="rounded-xl bg-red-100 px-4 py-3 font-medium text-[12px] text-red-600">
        거절 완료
      </div>
    );
  };

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
        {isLoading && <div className="py-30 text-center text-3xl text-card-muted">로딩중...</div>}
        {isError && (
          <div className="py-30 text-center text-3xl text-card-muted">제안한 개발자가 없어요.</div>
        )}

        {!isLoading && !isError && (data?.content?.length ?? 0) === 0 && (
          <div className="py-30 text-center text-3xl text-card-muted">
            {getEmptyMessage(devTab)}
          </div>
        )}

        {!isLoading &&
          !isError &&
          (data?.content ?? []).map((d) => {
            const cardProps = toProfileCardProps(d, defaultProfileUrl);

            const decision = getDecision(
              d.matchingId,
              d.decision as 'PENDING' | 'ACCEPT' | 'REJECT',
            );

            const isPending = decision === 'PENDING';

            return (
              <ProfileCard
                key={d.matchingId}
                {...cardProps}
                onClick={() => navigate(`/developer-detail/${d.developerNickname}`)}
                header={<Header projectName={d.projectName} />}
                action={
                  devTab === 'applied' ? (
                    isPending ? (
                      <Action
                        visible
                        disabled={respondMut.isPending}
                        onAccept={() => {
                          setLocalDecision((prev) => ({ ...prev, [d.matchingId]: 'ACCEPT' }));

                          respondMut.mutate(
                            { matchingId: d.matchingId, decision: 'ACCEPT' },
                            {
                              onError: () => {
                                setLocalDecision((prev) => ({
                                  ...prev,
                                  [d.matchingId]: 'PENDING',
                                }));
                              },
                            },
                          );
                        }}
                        onReject={() => {
                          setLocalDecision((prev) => ({ ...prev, [d.matchingId]: 'REJECT' }));

                          respondMut.mutate(
                            { matchingId: d.matchingId, decision: 'REJECT' },
                            {
                              onError: () => {
                                setLocalDecision((prev) => ({
                                  ...prev,
                                  [d.matchingId]: 'PENDING',
                                }));
                              },
                            },
                          );
                        }}
                      />
                    ) : (
                      renderDecisionBadge(decision)
                    )
                  ) : (
                    renderDecisionBadge(d.decision as 'PENDING' | 'ACCEPT' | 'REJECT')
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
