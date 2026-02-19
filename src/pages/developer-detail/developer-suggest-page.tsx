import { createMemberProposal } from '@apis/apply';
import type { MyProfile } from '@apis/myInfo/myInfo';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { getMyRecruitingProjects, type MyRecruitingProjectItem } from '@apis/projects';
import { getMemberProposal } from '@apis/apply';

import BackIcon from '@assets/icons/back.svg?react';
import { useAuth } from '@clerk/clerk-react';
import MainProjectCard from '@components/common/MainProjectCard';
import SelectDropdown from '@components/common/SelectDropdown';
import ImagePreview from '@components/profileDetail/ImagePreview';
import RoleChips from '@components/profileDetail/RoleChips';
import { DOMAIN_REVERSE_MAP } from '@constants/domain';
import { cn } from '@libs/cn';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const DROPDOWN_OPTIONS = [
  { label: 'PM', value: 'PM' },
  { label: '프론트엔드', value: 'FRONTEND' },
  { label: '백엔드', value: 'BACKEND' },
  { label: '인프라', value: 'INFRA' },
];
const DeveloperSuggestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { memberNick } = useParams<{ memberNick: string }>();
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<MyRecruitingProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isSuggested, setIsSuggested] = useState<boolean>();
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [proposalPart, setProposalPart] = useState<string | null>(null);
  const [proposalContent, setProposalContent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // navigate state로 전달된 프로필 데이터 가져오기
  const profileData = location.state?.profileData as { result?: MyProfile } | undefined;
  const { data: profileRes } = useQuery({
    ...myInfoQueries.memberProfile(memberNick ?? ''),
    enabled: Boolean(memberNick),
  });
  const profile = profileData?.result ?? profileRes?.result;

  // domains를 영어에서 한글로 변환
  const koreanDomains = useMemo(() => {
    const domains = profile?.domains ?? [];
    return domains.map((domain: string) => DOMAIN_REVERSE_MAP[domain] ?? domain);
  }, [profile?.domains]);

  const getSuggestions = async () => {
    try{
      if(selectedProjectId === null) return;
      const res = await getMemberProposal(selectedProjectId, memberNick);
      setIsSuggested(res?.data?.result?.exists)
      console.log("제안상태조회", res?.data?.result?.exists);
    } catch (e){
      console.error(e);
    }
  }
  useEffect(() => {
    getSuggestions()
  }, [selectedProjectId]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const list = await getMyRecruitingProjects(token);
        if (cancelled) return;
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].projectId);
      } catch (e) {
        if (cancelled) return;
        setProjects([]);
        setProjectsError(
          e instanceof Error ? e.message : '모집중인 프로젝트를 불러오지 못했습니다.',
        );
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const handleSubmit = async () => {
    if (!memberNick) return;
    if (!selectedProjectId) {
      setSubmitError('프로젝트를 선택해주세요.');
      return;
    }
    const trimmed = proposalContent.trim();
    if (!trimmed) {
      setSubmitError('제안 내용을 입력해주세요.');
      return;
    }
    const token = await getToken();
    if (!token) {
      setSubmitError('로그인이 필요합니다.');
      return;
    }
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await createMemberProposal(memberNick, selectedProjectId, proposalPart, trimmed, token);
      alert('제안을 보냈습니다.');
      navigate(-1);
      setSubmitSuccess(true);
      setProposalContent('');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '제안하기에 실패했습니다.';
      alert(errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-20">
      <header className="flex flex-col gap-6 pt-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ui-700 hover:bg-ui-100"
          aria-label="뒤로가기"
        >
          <BackIcon className="h-8 w-8" />
        </button>
        <div className="flex flex-col gap-2">
          <p className="font-bold text-4xl text-ui-900">
            프로젝트를 선택해
            <br />[{memberNick}]님에게 매칭을 제안하세요!
          </p>
        </div>
      </header>

      <section className="mt-10 flex w-full max-w-[500px] flex-col gap-6 rounded-3xl border border-ui-200 bg-ui-bg p-8">
        <div className="flex flex-row items-start gap-5">
          <ImagePreview
            isExist={profile?.member?.imageUrl !== undefined}
            imageUrl={profile?.member?.imageUrl}
          />
          <div className="flex flex-col gap-2">
            <RoleChips
              roleTone={profile?.member?.mainType === 'DEVELOPER' ? 'green' : 'blue'}
              role={profile?.member?.mainType === 'DEVELOPER' ? '개발자' : 'PM'}
            />
            <p className="pl-2 font-semibold text-2xl text-ui-1000">{profile?.member?.nickname}</p>
            <div className="flex flex-wrap gap-2">
              {koreanDomains.map((item: string, index: number) => (
                <span
                  key={index}
                  className="rounded-lg bg-ui-100 px-2.5 py-1 font-semibold text-sm text-ui-600"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="pl-2 font-normal text-sm text-ui-600">
              {profile?.member?.body || '소개가 입력되지 않았어요.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-3xl text-ui-1000">나의 프로젝트</p>
        </div>
        {projectsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`project-skeleton-${i}`}
                className="h-[220px] rounded-2xl border border-ui-200 bg-ui-50"
              />
            ))}
          </div>
        ) : projectsError ? (
          <p className="text-md text-red-500">{projectsError}</p>
        ) : projects.length === 0 ? (
          <p className="text-[14px] text-ui-500">모집중인 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-[1.6rem] sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((project) => {
              const isSelected = selectedProjectId === project.projectId;
              return (
                <div key={project.projectId} className="relative">
                  <MainProjectCard
                    title={project.title || `프로젝트 #${project.projectId}`}
                    thumbnailUrl={project.thumbnailUrl}
                    thumbnailAlt={project.title}
                    categoryLabel={project.categoryName}
                    location={project.location}
                    durationRangeName={project.durationRangeName}
                    mode={project.modeName}
                    showBookmark={false}
                    onClick={() => setSelectedProjectId(project.projectId)}
                  />
                  <div
                    className={cn(
                      'absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full font-bold text-xl',
                      isSelected
                        ? 'bg-primary text-white'
                        : 'border border-ui-200 bg-ui-200 text-ui-300',
                    )}
                  >
                    ✓
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12 flex flex-col gap-5">
        <p className="font-bold text-3xl text-ui-1000">제안 포지션</p>
        <SelectDropdown
          placeholder="포지션을 선택해주세요"
          value={proposalPart}
          onChange={setProposalPart}
          options={DROPDOWN_OPTIONS}
          className="w-115"
        />
      </section>
      <section className="mt-12 flex flex-col gap-5">
        <p className="font-bold text-3xl text-ui-1000">제안 내용</p>
        <textarea
          placeholder="제안 내용을 입력해주세요."
          value={proposalContent}
          onChange={(e) => setProposalContent(e.target.value)}
          className="h-72 w-full resize-none rounded-2xl bg-ui-50 p-6 text-[14px] text-ui-800 placeholder:text-ui-500"
        />
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitLoading || !selectedProjectId || isSuggested}
            className={cn('rounded-xl bg-primary px-30 py-6 font-medium text-lg text-white disabled:cursor-not-allowed disabled:opacity-60', isSuggested & "bg-ui-50 text-ui-500")}
          >
            {submitLoading ? '전송 중...' : isSuggested ? '제안완료' : '제안하기'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default DeveloperSuggestPage;
