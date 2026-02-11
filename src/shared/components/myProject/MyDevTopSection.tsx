import ProjectLg from '@components/common/ProjectLg';
import Tabs from '@components/tab/CommonTabs';
import { type DevTab, type MatchingProject, useDevProjects } from '@hooks/useDevProjects';
import { useNavigate } from 'react-router-dom';
import { PROJECT_ROLES, type ProjectListItem } from 'src/mocks/project.mock';

type Props = {
  devTab: DevTab;
  onChangeDevTab: (tab: DevTab) => void;
};

function getEmptyMessage(tab: DevTab) {
  return tab === 'suggested' ? '받은 제안이 없어요.' : '지원 중인 프로젝트가 없어요.';
}

function toProjectLgProps(p: MatchingProject): ProjectListItem {
  return {
    id: p.projectId,
    title: p.projectName,
  } as unknown as ProjectListItem;
}

const ProposalAction = ({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) => (
  <div className="flex gap-3">
    <button
      type="button"
      className="cursor-pointer rounded-xl bg-[#4E49FF] px-3 py-2 font-medium text-[12px] text-my-tab-inactive"
      onClick={(e) => {
        e.stopPropagation();
        onAccept();
      }}
    >
      수락하기
    </button>
    <button
      type="button"
      className="cursor-pointer rounded-xl bg-surface-tab px-3 py-2 font-medium text-[12px] text-my-tab-text"
      onClick={(e) => {
        e.stopPropagation();
        onReject();
      }}
    >
      거절하기
    </button>
  </div>
);

const AppliedBadge = ({ decision }: { decision?: string }) => {
  if (decision === 'ACCEPT')
    return (
      <div className="rounded-xl bg-green-100 px-4 py-3 font-medium text-[13px] text-green-600">
        수락됨
      </div>
    );
  if (decision === 'REJECT')
    return (
      <div className="rounded-xl bg-red-100 px-4 py-3 font-medium text-[13px] text-red-600">
        거절됨
      </div>
    );

  return (
    <div className="rounded-xl bg-gray-100 px-4 py-3 font-medium text-[13px] text-gray-500">
      응답 대기 중
    </div>
  );
};

const MyDevTopSection = ({ devTab, onChangeDevTab }: Props) => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDevProjects(devTab);
  // console.log(data);

  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  const empty = !isLoading && !isError && (data?.content?.length ?? 0) === 0;

  return (
    <section>
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
        {isLoading && <div className="py-30 text-center text-3xl text-card-muted">로딩중...</div>}
        {isError && (
          <div className="py-30 text-center text-3xl text-card-muted">불러오기에 실패했어요.</div>
        )}
        {empty && (
          <div className="py-30 text-center text-3xl text-card-muted">
            {getEmptyMessage(devTab)}
          </div>
        )}

        {!isLoading &&
          !isError &&
          (data?.content ?? []).map((m) => {
            const projectProps = toProjectLgProps(m);

            return (
              <ProjectLg
                key={m.matchingId}
                {...projectProps}
                roles={[...PROJECT_ROLES]}
                showBookmark={false}
                showDue={false}
                action={
                  devTab === 'suggested' ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="cursor-pointer rounded-xl bg-[#4E49FF] px-3 py-2 font-medium text-[12px] text-my-tab-inactive"
                        onClick={(event) => {
                          event.stopPropagation();
                          console.log('수락', m.matchingId);
                        }}
                      >
                        수락하기
                      </button>

                      <button
                        type="button"
                        className="cursor-pointer rounded-xl bg-surface-tab px-3 py-2 font-medium text-[12px] text-my-tab-text"
                        onClick={(event) => {
                          event.stopPropagation();
                          console.log('거절', m.matchingId);
                        }}
                      >
                        거절하기
                      </button>
                    </div>
                  ) : m.decision === 'PENDING' ? (
                    <div className="rounded-xl bg-gray-100 px-4 py-3 font-medium text-[13px] text-gray-500">
                      응답 대기 중
                    </div>
                  ) : m.decision === 'ACCEPT' ? (
                    <div className="rounded-xl bg-green-100 px-4 py-3 font-medium text-[13px] text-green-600">
                      수락됨
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-100 px-4 py-3 font-medium text-[13px] text-red-600">
                      거절됨
                    </div>
                  )
                }
                onClick={() => handleProjectClick(m.projectId)}
              />
            );
          })}
      </div>
    </section>
  );
};

export default MyDevTopSection;
export type { DevTab };
