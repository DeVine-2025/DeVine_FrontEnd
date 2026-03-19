
import { useEffect, useMemo, useState } from 'react';
import Lottie from 'lottie-react';
import reportAnimation from './Data _ Bundling.json';
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useAuth } from '@clerk/clerk-react';
import { getGitRepos } from '@apis/github-repos';
import { createReportSync, getReportDetail, getReportMain } from '@apis/reports';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { RootLayoutOutletContext } from '@layouts/root-layout';

type GithubRepoSelectionSectionProps = {
  onBack: () => void;
  onNext: () => void;
};

type RepoOption = {
  id: number;
  name: string;
  desc: string | null;
  url: string;
  hasReport: boolean;
};

type ReportCardData = {
  title: string;
  desc: string;
};

const GithubRepoSelectionSection = ({ onBack, onNext }: GithubRepoSelectionSectionProps) => {
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);
  const [phase, setPhase] = useState<'select' | 'generating' | 'complete'>('select');
  const [tipIndex, setTipIndex] = useState(0);
  const [repoOptions, setRepoOptions] = useState<RepoOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [mainReport, setMainReport] = useState<ReportCardData | null>(null);
  const [detailReport, setDetailReport] = useState<ReportCardData | null>(null);
  const { getToken } = useAuth();
  const { setNavLocked, setLogoClickHandler } = useOutletContext<RootLayoutOutletContext>();
  const navigate = useNavigate();
  const [isWaitModalOpen, setIsWaitModalOpen] = useState(false);

  const tips = [
    {
      title: '이 리포트를 다른 사람에게도 보여줄까요?',
      body: '공개 설정은 내 마음대로 바꿀 수 있어요',
    },
    {
      title: '나와 맞는 프로젝트와 개발자들',
      body: '추천 프로젝트/개발자 탭에서 확인해보세요.',
    },
  ];

  const canProceed = useMemo(() => selectedRepo !== null, [selectedRepo]);

  const toggleRepo = (id: number) => {
    setSelectedRepo((prev) => (prev === id ? null : id));
  };

  const createReportMutation = useMutation({
    mutationFn: async (repoId: number) => {
      const token = await getToken();
      return createReportSync(repoId, token || '');
    },
    onMutate: () => {
      setCreateError(null);
      setPhase('generating');
    },
    onSuccess: async (_, repoId) => {
      try {
        const token = await getToken();
        const [main, detail] = await Promise.all([
          getReportMain(repoId, token ?? undefined),
          getReportDetail(repoId, token ?? undefined),
        ]);
        const selected = repoOptions.find((repo) => repo.id === repoId);
        setMainReport(getReportCardData(main, selected));
        setDetailReport(getReportCardData(detail, selected));
      } catch {
        const selected = repoOptions.find((repo) => repo.id === repoId);
        setMainReport(getReportCardData(null, selected));
        setDetailReport(getReportCardData(null, selected));
      } finally {
        setPhase('complete');
      }
    },
    onError: (error) => {
      setPhase('select');
      setCreateError(error instanceof Error ? error.message : '리포트 생성에 실패했어요.');
    },
  });

  const handleGenerate = () => {
    if (!canProceed || phase !== 'select') return;
    if (!selectedRepo) return;
    createReportMutation.mutate(selectedRepo);
  };


  const getReportCardData = (data: unknown, fallback?: RepoOption | null): ReportCardData => {
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const content = record?.content && typeof record.content === 'object'
      ? (record.content as Record<string, unknown>)
      : null;
    const projectOverview =
      content?.projectOverview && typeof content.projectOverview === 'object'
        ? (content.projectOverview as Record<string, unknown>)
        : null;
    const title =
      (content?.reportTitle as string | undefined) ||
      (record?.reportTitle as string | undefined) ||
      (record?.repositoryName as string | undefined) ||
      (record?.repoName as string | undefined) ||
      (record?.name as string | undefined) ||
      fallback?.name ||
      '레포지토리 이름이 들어가는 자리입니다.';
    const desc =
      (projectOverview?.purpose as string | undefined) ||
      (content?.summary as string | undefined) ||
      (record?.summary as string | undefined) ||
      (record?.description as string | undefined) ||
      fallback?.desc ||
      '레포지토리 설명이 들어가는 자리입니다.';
    return { title, desc };
  };

  useEffect(() => {
    if (phase !== 'generating') return;
    setTipIndex(0);
    const timer = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [phase, tips.length]);

  useEffect(() => {
    setNavLocked(phase === 'generating');
    return () => setNavLocked(false);
  }, [phase, setNavLocked]);

  useEffect(() => {
    setLogoClickHandler(() => () => setIsWaitModalOpen(true));
    return () => setLogoClickHandler(null);
  }, [setLogoClickHandler]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setLoadError(null);

    const fetchRepos = async () => {
      try {
        const token = await getToken();
        const repos = await getGitRepos(token ?? undefined);
        if (!isActive) return;
        setRepoOptions(
          repos.map((repo) => ({
            id: repo.gitRepoId,
            name: repo.name,
            desc: repo.description,
            url: repo.gitUrl,
            hasReport: repo.hasReport,
          })),
        );
      } catch (error) {
        if (!isActive) return;
        setLoadError(error instanceof Error ? error.message : '레포 목록을 불러오지 못했어요.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchRepos();
    return () => {
      isActive = false;
    };
  }, [getToken]);

  if (phase === 'generating') {
    return (
    <div className="mx-auto flex h-[660px] w-full max-w-[632px] -translate-y-12 flex-col items-center justify-start pt-0 text-center">
        <div className="flex flex-col items-center gap-3">
          <Lottie animationData={reportAnimation} loop className="-mt-20 h-[550px] w-[550px]" />
          <h2 className="-mt-74 text-[24px] font-semibold text-[var(--ui-1000)]">
            리포트를 생성하는 중이에요
          </h2>
          <div className="mt-12 flex flex-col items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[var(--badge-bg-primary)] px-4 py-2 text-[13px] font-semibold text-[var(--badge-text-primary)]">
              TIP
            </span>
            <p className="text-[14px] leading-6 text-[var(--ui-400)]">
              {tips[tipIndex]?.title}
              <br />
              {tips[tipIndex]?.body}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col items-center justify-start gap-6 pt-[20px] text-center">
        <h2 className="text-[36px] leading-[133%] font-bold tracking-[-0.027em] text-[var(--ui-1000)]">
          리포트 생성이 완료되었어요!
        </h2>
        <br/>
        <div className="grid w-full max-w-[640px] grid-cols-2 gap-6">
          <div className="flex h-[270px] w-[280px] flex-col gap-3 rounded-[24px] border border-card-border bg-card-bg p-4 text-left">
            <span className="Caption1 inline-flex w-fit rounded-full bg-[var(--badge-bg-primary)] px-2 py-1 text-[10px] text-[var(--badge-text-primary)]">
              메인
            </span>
            <h3 className="Body1 font-semibold text-[var(--ui-900)]">{mainReport?.title}</h3>
            <p className="Caption1 text-[var(--ui-400)]">{mainReport?.desc}</p>
          </div>
          <div className="flex h-[270px] w-[280px] flex-col gap-3 rounded-[24px] border border-card-border bg-card-bg p-4 text-left">
            <span className="Caption1 inline-flex w-fit rounded-full bg-[var(--badge-bg-primary)] px-2 py-1 text-[10px] text-[var(--badge-text-primary)]">
              상세
            </span>
            <h3 className="Body1 font-semibold text-[var(--ui-900)]">{detailReport?.title}</h3>
            <p className="Caption1 text-[var(--ui-400)]">{detailReport?.desc}</p>
          </div>
        </div><br/>
        <button
          type="button"
          onClick={onNext}
          className="mt-15 Body1 h-[48px] w-[280px] rounded-xl bg-[var(--color-primary)] font-semibold text-white"
        >
          메인 화면으로 이동하기
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] px-10 pb-20 pt-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
          <h2 className="Heading2 font-semibold">리포트를 생설할 <br/>레포지토리를 선택해주세요</h2>
        </div>
        <div className="flex flex-col gap-4">
          <span className="Body1 text-[15px] font-semibold text-[var(--ui-900)]">
            깃허브 레포지토리 목록
          </span>
          {isLoading && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" />
            </div>
          )}
          {loadError && <span className="Caption1 text-[var(--ui-danger)]">{loadError}</span>}
          {createError && <span className="Caption1 text-[var(--ui-danger)]">{createError}</span>}
          <div className="scrollbar-hide max-h-[320px] overflow-y-auto pr-1">
            <div className="flex flex-col gap-4">
              {repoOptions.map((repo) => {
                const selected = selectedRepo === repo.id;
                return (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => toggleRepo(repo.id)}
                    className="flex items-start gap-3 text-left"
                    aria-pressed={selected}
                  >
                    {selected ? (
                      <CheckboxCheckedIcon
                        className="mt-1 h-7 w-7 shrink-0 text-[var(--color-primary)]"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckboxUncheckedIcon className="mt-1 h-7 w-7 shrink-0" aria-hidden="true" />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="Body1 text-[var(--ui-900)]">{repo.name}</span>
                      <span className="Caption1 text-[var(--ui-400)]">
                        {repo.desc ?? '설명이 없는 레포지토리입니다.'}
                      </span>
                    </div>
                  </button>
                );
              })}
              {!isLoading && repoOptions.length === 0 && !loadError && (
                <div className="flex flex-col items-start gap-3">
                  <span className="Caption1 text-[var(--ui-400)]">가져올 레포지토리가 없어요.</span>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="Body1 h-[48px] w-full rounded-xl font-semibold bg-[var(--color-primary)] text-white"                  >
                    메인으로 가기
                  </button>
                </div>
                
              )}
            </div>
          </div>
        </div>
      </div>

      {repoOptions.length > 0 && (
        <div className="mt-auto mb-24 flex flex-col gap-3">
          <button
            type="button"
            disabled={!canProceed || createReportMutation.isPending}
            onClick={handleGenerate}
            className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
              canProceed
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
            }`}
          >
            {createReportMutation.isPending ? '리포트 생성 중...' : '선택 완료'}
          </button>
          <button type="button" onClick={onBack} className="Body1 text-[var(--ui-400)]">
            <span className="cursor-pointer">돌아가기</span>
          </button>
        </div>
      )}
      </div>

      {isWaitModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[360px] rounded-[24px] bg-[var(--ui-bg)] px-8 pb-8 pt-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h2 className="text-[18px] font-semibold text-[var(--ui-900)]">
              리포트 제작 중이에요
            </h2>
            <p className="mt-2 text-[13px] text-[var(--ui-400)]">
              제작이 끝날 때까지 잠시만 기다려 주세요.
            </p>
            <button
              type="button"
              onClick={() => setIsWaitModalOpen(false)}
              className="mt-6 h-[48px] w-full rounded-[12px] bg-[#4E49FF] text-[16px] font-semibold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GithubRepoSelectionSection;
