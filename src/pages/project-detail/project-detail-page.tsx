import ProfileDefaultImage from '@assets/images/Profile_dark.svg';
import RecruitmentProgress from '@components/cards/RecruitmentProgress';
import DevineDefaultImage from '@assets/images/devine-symbol.png';
import type { ProjectStatus } from '@apis/project-detail';
import TalkBalloonIcon from '@assets/icons/detail-page/talkBalloon.svg?react';
import BookmarkButton from '@components/common/BookmarkButton';
import TechStackChip from '@components/common/TechStackChip';
import { useAuth } from '@clerk/clerk-react';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { useChatWidgetStore } from '@store/chatWidget';
import type { ChatRoomsListData } from '@t/chat';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock, Cloud, Code2, Database, Layers, MapPin, Monitor, PanelTop, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ApplyModal from './components/ApplyModal';
import ImageLightbox from './components/ImageLightbox';
import LoginModal from './components/LoginModal';
import { useProjectDetail } from './hooks/useProjectDetail';

const ProjectDetailPage = () => {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const {
    projectId,
    isSampleProject,
    navigate,
    project,
    isLoading,
    isOwner,
    creatorImage,
    bookmarkState,
    handleBookmarkChange,
    handleCancelApply,
    openApplyModal,
    isApplyModalOpen,
    setIsApplyModalOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    selectedRole,
    setSelectedRole,
    isRoleMenuOpen,
    setIsRoleMenuOpen,
    hasApplied,
    appliedStatus,
    appliedPart,
    isApplying,
    handleApply,
    roleOptions,
    selectedRoleLabel,
    imageLightboxIndex,
    setImageLightboxIndex,
    projectStatus,
    isStatusMenuOpen,
    setIsStatusMenuOpen,
    isStatusUpdating,
    statusMenuRef,
    STATUS_OPTIONS,
    currentStatusLabel,
    handleStatusChange,
  } = useProjectDetail();

  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const handleContactClick = useCallback(() => {
    if (isSampleProject) { window.alert('예시 프로젝트에서는 연락을 보낼 수 없습니다.'); return; }
    if (!isSignedIn) {
      window.alert('로그인 후 이용해 주세요.');
      return;
    }
    const clerkId = project?.creatorClerkId?.trim();
    if (!clerkId) {
      window.alert('채팅을 시작할 수 없어요. 회원 정보가 아직 연결되지 않았습니다.');
      return;
    }
    const rooms = queryClient.getQueryData<ChatRoomsListData>(CHAT_ROOMS_QUERY_KEY)?.rooms ?? [];
    const existing = rooms.find((room) => room.otherMember.clerkId === clerkId);
    if (existing) {
      useChatWidgetStore.getState().requestOpenRoom(existing.roomId);
      return;
    }
    useChatWidgetStore.getState().requestOpenDraft({
      targetClerkId: clerkId,
      nickname: project?.creatorName ?? undefined,
      image: creatorImage ?? null,
    });
  }, [creatorImage, isSampleProject, isSignedIn, project?.creatorClerkId, project?.creatorName, queryClient]);

  const isApply = appliedStatus === 'PENDING' || appliedStatus === 'PROCESSING';
  const isAccepted = appliedStatus === 'COMPLETED';
  const canApply = appliedStatus == null || appliedStatus === 'CANCELLED';
  const roles = project?.roles ?? [];
  const memberCount = project?.memberCount ?? { current: roles.reduce((sum, role) => sum + role.current, 0), total: roles.reduce((sum, role) => sum + role.total, 0) };
  const status = projectStatus ?? project?.status;

  // ── Early returns ──

  if (!projectId || (!project && !isLoading)) {
    return <div>프로젝트 정보를 찾을 수 없습니다.</div>;
  }
  if (!project) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <span role="status" className="text-sm text-[var(--text-secondary)]">불러오는 중...</span>
      </div>
    );
  }

  const images = project.imageUrls ?? [];
  const selectedImage = Math.min(galleryIndex, Math.max(0, images.length - 1));
  const dateLabel = project.recruitmentDate ?? (project.dueLabel?.startsWith('D-') ? undefined : project.dueLabel);
  const countdown = project.countdown ?? (project.dueLabel?.startsWith('D-') ? project.dueLabel : undefined);

  const statusLabel = status === 'RECRUITING' ? '모집 중' : status === 'IN_PROGRESS' ? '진행 중' : status === 'COMPLETED' ? '완료' : undefined;

  return (
    <section className="mx-auto desktop-content w-[var(--desktop-content-width,100%)] max-w-[1260px] px-[20px] pb-[64px] text-[var(--text-main)] sm:px-[24px] [&_a:focus-visible]:outline-2 [&_button:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[var(--project-accent)] [&_button:focus-visible]:outline-[var(--project-accent)]">
      <nav aria-label="현재 위치" className="mb-[16px] flex flex-wrap items-center gap-[12px] text-[13px] text-[var(--text-secondary)]">
        <Link to="/search/projects" className="inline-flex items-center gap-[12px] rounded hover:text-[var(--text-main)]">
          <ArrowLeft size={16} aria-hidden="true" />
          프로젝트 탐색
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page" className="font-semibold text-[var(--text-main)]">{project.title}</span>
      </nav>

      <div className="grid items-start gap-x-[40px] gap-y-[24px] lg:max-2xl:gap-x-[clamp(24px,2.6vw,38px)] lg:max-2xl:gap-y-[18px] lg:grid-cols-[minmax(0,1fr)_clamp(320px,32%,384px)]">
        <header className="flex min-w-0 items-start justify-between gap-[16px] lg:col-start-1 lg:row-start-1">
          <div className="min-w-0">
            <h1 className="break-words text-[32px] leading-tight font-bold tracking-tight sm:text-[36px]">{project.title}</h1>
            {project.description && <p className="mt-[8px] text-[16px] leading-relaxed text-[var(--text-secondary)]">{project.description}</p>}
            {project.creatorName && (
              <p className="mt-[6px] flex items-center gap-[8px] text-[13px] text-[var(--text-secondary)]">
                {creatorImage && <img src={creatorImage} alt="" className="h-[24px] w-[24px] rounded-full object-cover" />}
                {project.creatorName}
              </p>
            )}
          </div>
          <BookmarkButton bookmarked={bookmarkState.bookmarked} onBookmarkChange={handleBookmarkChange}
            className="h-[36px] w-[36px] shrink-0 rounded-md"
            iconClassName="h-[20px] w-[20px]" aria-label="북마크" />
        </header>

        {images.length > 0 && (
          <div className="grid min-w-0 gap-[12px] lg:col-start-1 lg:row-start-2">
            <button type="button" aria-label={project.title + ' 이미지 확대'} onClick={() => setImageLightboxIndex(selectedImage)}
              className="relative grid h-[216px] w-full place-items-center overflow-hidden rounded-xl border border-[var(--project-divider)] bg-[var(--surface-image)] sm:h-[248px] lg:max-2xl:h-[clamp(208px,29svh,240px)]">
              <AnimatePresence initial={false}>
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={project.title + ' 프로젝트 이미지'}
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
                  className={images[selectedImage] === DevineDefaultImage
                    ? 'absolute w-[96px] object-contain'
                    : 'absolute inset-0 h-full w-full min-h-0 object-cover'}
                />
              </AnimatePresence>
              {images.length > 1 && (
                <span className="absolute right-[12px] bottom-[12px] rounded-full bg-[var(--surface-filter)] px-[10px] py-[4px] text-[12px] font-semibold tabular-nums">
                  {selectedImage + 1} / {images.length}
                </span>
              )}
            </button>
            <div className="flex min-w-0 gap-[10px] overflow-x-auto" aria-label="프로젝트 이미지 선택">
              {images.map((image, index) => (
                <button key={image + index} type="button" aria-label={(index + 1) + '번 이미지'}
                  aria-pressed={index === selectedImage} onClick={() => setGalleryIndex(index)}
                  className="grid h-[57px] w-[96px] shrink-0 place-items-center overflow-hidden rounded-[10px] border border-[var(--project-divider)] bg-[var(--surface-image)] hover:border-[var(--project-control-border)] focus-visible:outline-offset-[-3px] aria-pressed:border-[color-mix(in_srgb,var(--project-accent)_60%,transparent)]">
                  <img src={image} alt="" className={image === DevineDefaultImage ? 'w-[32px] object-contain' : 'h-full w-full min-h-0 object-cover'} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}

        <aside aria-label="모집 현황 및 프로젝트 정보" className={`min-w-0 rounded-xl border border-[var(--project-divider)] bg-[color-mix(in_srgb,var(--surface-filter)_40%,transparent)] p-[18px] sm:p-[20px] lg:sticky lg:top-[92px] lg:col-start-2 lg:row-end-4 ${images.length > 0 ? 'lg:row-start-2' : 'lg:row-start-1'}`}>
          {statusLabel && (
            <span className={'inline-flex items-center gap-[8px] rounded-full px-[12px] py-[6px] text-[14px] font-semibold ' + (status === 'RECRUITING' ? 'bg-[var(--positive-bg)] text-[var(--positive-text)]' : 'bg-[var(--surface-badge)] text-[var(--text-secondary)]')}>
              <span className="h-[9px] w-[9px] rounded-full bg-current" aria-hidden="true" />
              {statusLabel}
            </span>
          )}
          {(countdown || memberCount.total > 0) && (
            <div className="mt-[14px] flex flex-wrap items-end justify-between gap-[12px]">
              {countdown && (
                <div>
                  <p className="mb-[4px] text-[14px] text-[var(--text-secondary)]">모집 마감까지</p>
                  <p className="text-[40px] leading-none font-bold tracking-tight tabular-nums">{countdown}</p>
                </div>
              )}
              {memberCount.total > 0 && (
                <div className="ml-auto text-right">
                  <RecruitmentCount current={memberCount.current} total={memberCount.total} />
                  {memberCount.current >= memberCount.total && (
                    <p className="mt-[3px] text-[14px] text-[var(--text-secondary)]">모집 완료</p>
                  )}
                </div>
              )}
            </div>
          )}
          {memberCount.total > 0 && (
            <div className="mt-[20px]">
              <DetailProgress current={memberCount.current} total={memberCount.total} />
            </div>
          )}

          <section aria-labelledby="project-info-heading" className="mt-[20px] border-t border-[var(--project-divider)] pt-[16px]">
            <h2 id="project-info-heading" className="text-[20px] font-semibold tracking-tight">프로젝트 정보</h2>
            <dl className="mt-[14px] grid gap-[12px]">
              <MetaRow icon={CalendarDays} label="모집 마감일" value={dateLabel ?? countdown ?? '미정'} />
              <MetaRow icon={PanelTop} label="프로젝트 유형" value={project.categoryLabel ?? '미정'} />
              <MetaRow icon={Layers} label="도메인" value={project.deadlineLabel ?? '미정'} />
              <MetaRow icon={MapPin} label="진행 장소" value={project.location || '추후 결정 예정'} />
              <MetaRow icon={Monitor} label="진행 방식" value={project.mode ?? '미정'} />
              <MetaRow icon={Clock} label="진행 기간" value={project.period ?? '미정'} />
            </dl>
          </section>

          <div className="mt-[20px] flex flex-col gap-[10px] border-t border-[var(--project-divider)] pt-[16px]">
            {isOwner ? <>
              <button type="button" className={secondaryAction} onClick={() => navigate('/project/create', { state: { projectId: Number(project.id), mode: 'edit' } })}>프로젝트 수정</button>
              <StatusMenu statusMenuRef={statusMenuRef} projectStatus={projectStatus} isStatusMenuOpen={isStatusMenuOpen} isStatusUpdating={isStatusUpdating} currentStatusLabel={currentStatusLabel} STATUS_OPTIONS={STATUS_OPTIONS} onToggle={() => setIsStatusMenuOpen(prev => !prev)} onChange={handleStatusChange} />
            </> : <>
              {canApply && <button type="button" onClick={openApplyModal} className="flex min-h-[46px] items-center justify-center gap-[8px] rounded-[8px] bg-[var(--project-accent)] px-[12px] text-[15px] font-semibold text-[var(--surface-page)] hover:brightness-110">프로젝트 지원하기 <ArrowRight size={16} aria-hidden="true" /></button>}
              {isApply && <>
                <button type="button" className={secondaryAction} onClick={() => { if (appliedPart) setSelectedRole(appliedPart); setIsApplyModalOpen(true); setIsRoleMenuOpen(false); }}>지원 파트 변경하기</button>
                <button type="button" className={secondaryAction} onClick={handleCancelApply}>지원 취소하기</button>
              </>}
              {isAccepted && <button type="button" disabled className={secondaryAction}>수락 완료</button>}
              <button type="button" className={secondaryAction} onClick={handleContactClick}><TalkBalloonIcon aria-hidden="true" className="h-[16px] w-[16px]" /> 프로젝트 문의하기</button>
            </>}
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-3">
          <section aria-labelledby="project-roles-heading">
            <h2 id="project-roles-heading" className="pb-[10px] text-[20px] font-semibold tracking-tight">모집 분야</h2>
            {roles.length ? (
              <div className="overflow-x-auto" role="region" aria-label="포지션별 모집 현황" tabIndex={0}>
                <table className="w-full min-w-[500px] table-fixed border-b border-[var(--project-divider)] text-left">
                  <thead className="border-y border-[var(--project-divider)] text-[13px] text-[var(--text-secondary)]">
                    <tr>
                      <th scope="col" className="w-[26%] py-[10px] pr-[16px] font-medium">포지션</th>
                      <th scope="col" className="w-[44%] py-[10px] pr-[16px] font-medium">기술</th>
                      <th scope="col" className="py-[10px] font-medium">현황</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--project-divider)]">
                    {roles.map(role => (
                      <tr key={role.key}>
                        <th scope="row" className="py-[16px] pr-[16px] align-middle text-[16px] font-semibold">
                          <span className="flex items-center gap-[12px]">
                            <RoleIcon roleKey={role.key} label={role.label} />
                            <span className="min-w-0 break-words">{role.label}</span>
                          </span>
                        </th>
                        <td className="py-[16px] pr-[16px]">
                          {role.techStacks.length > 0 && (
                            <ul className="flex flex-wrap gap-[6px]">
                              {[...new Set(role.techStacks)].map(tech => <TechStackChip key={tech} name={tech} />)}
                            </ul>
                          )}
                        </td>
                        <td className="py-[16px]">
                          {role.total > 0 && (
                            <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[var(--text-main)]">
                              <RecruitmentCount current={role.current} total={role.total} />
                              {role.current >= role.total && <span className="rounded-md bg-[var(--surface-badge)] px-[6px] py-[3px] text-[11px] font-medium text-[var(--text-secondary)]">모집 완료</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="pb-[16px] text-[14px] text-[var(--text-secondary)]">모집 정보가 없습니다.</p>}
          </section>

          {project.features && project.features.length > 0 && (
            <section aria-labelledby="project-features-heading" className="mt-[28px]">
              <h2 id="project-features-heading" className="mb-[8px] flex items-center gap-[10px] text-[20px] font-semibold tracking-tight"><span aria-hidden="true" className="h-[20px] w-[3px] shrink-0 rounded-full bg-[var(--project-accent)]" />주요 기능</h2>
              <ul className="list-disc space-y-[4px] pl-[22px] text-[17px] leading-[1.8] text-[var(--text-secondary)] marker:text-[var(--project-accent)]">
                {project.features.map(feature => <li key={feature}>{feature}</li>)}
              </ul>
            </section>
          )}

          <section aria-labelledby="project-intro-heading" className="mt-[28px]">
            <h2 id="project-intro-heading" className="mb-[8px] flex items-center gap-[10px] text-[20px] font-semibold tracking-tight"><span aria-hidden="true" className="h-[20px] w-[3px] shrink-0 rounded-full bg-[var(--project-accent)]" />프로젝트 소개</h2>
            <div className="break-words text-[17px] leading-[1.8] text-[var(--text-secondary)] [&_a]:text-[var(--project-accent)] [&_a]:underline [&_h2]:mt-[16px] [&_h2]:font-semibold [&_h3]:mt-[16px] [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-[24px] [&_ul]:list-disc [&_ul]:pl-[24px] [&_ul>li::marker]:text-[var(--project-accent)]" dangerouslySetInnerHTML={{ __html: project.summary?.trim() || '<p>프로젝트 소개 정보가 없습니다.</p>' }} />
          </section>
        </div>
      </div>
      {/* 이미지 라이트박스 */}
      {imageLightboxIndex !== null && project.imageUrls?.[imageLightboxIndex] && (
        <ImageLightbox
          imageUrls={project.imageUrls}
          currentIndex={imageLightboxIndex}
          title={project.title}
          onClose={() => setImageLightboxIndex(null)}
          onChangeIndex={setImageLightboxIndex}
        />
      )}

      {/* 지원 모달 */}
      {isApplyModalOpen && (
        <ApplyModal

          projectTitle={project.title}
          hasApplied={hasApplied}
          selectedRole={selectedRole}
          selectedRoleLabel={selectedRoleLabel}
          isRoleMenuOpen={isRoleMenuOpen}
          isApplying={isApplying}
          roleOptions={roleOptions}
          onSelectRole={(key) => {
            setSelectedRole(key);
            setIsRoleMenuOpen(false);
          }}
          onToggleRoleMenu={() => setIsRoleMenuOpen((prev) => !prev)}
          onApply={handleApply}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}

      {/* 로그인 모달 */}
      {isLoginModalOpen && (
        <LoginModal

          onLogin={() =>
            navigate('/login', {
              state: { postLoginRedirectPath: `/project/${projectId}` },
            })
          }
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </section>
  );
};

export default ProjectDetailPage;

// ── Helper components ──

const secondaryAction = 'flex min-h-[46px] items-center justify-center gap-[9px] rounded-[8px] border border-[var(--project-control-border)] px-[10px] text-[14px] font-medium hover:bg-[var(--surface-card)] disabled:opacity-60';

function RoleIcon({ roleKey, label }: { roleKey: string; label: string }) {
  const key = roleKey.toUpperCase();
  const Icon = key === 'FRONTEND' || label.includes('프론트엔드') ? Code2
    : key === 'BACKEND' || label.includes('백엔드') ? Database
      : key === 'INFRA' || label.includes('인프라') ? Cloud : null;

  return Icon
    ? <Icon size={17} aria-hidden="true" className="shrink-0 text-[var(--project-accent)]" />
    : <span aria-hidden="true" className="h-[8px] w-[8px] shrink-0 rounded-full bg-[var(--project-accent)]" />;
}

function RecruitmentCount({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      {current > 0 && (
        <div aria-hidden="true" className="flex items-center gap-[2px]">
          {Array.from({ length: Math.min(current, 2) }, (_, index) => (
            <img key={index} src={ProfileDefaultImage} alt="" className="h-[24px] w-[24px] rounded-full bg-[var(--surface-badge)]" />
          ))}
          {current > 2 && (
            <span className="grid h-[24px] min-w-[24px] place-items-center rounded-full bg-[var(--surface-badge)] px-[4px] text-[11px]">+{current - 2}</span>
          )}
        </div>
      )}
      <p className="text-[14px] font-semibold tabular-nums">{current}/{total}명 모집</p>
    </div>
  );
}

function DetailProgress({ current, total }: { current: number; total: number }) {
  return (
    <RecruitmentProgress
      current={current}
      total={total}
      maxSegments={12}
      className="flex gap-[4px] [&>span]:h-[7px] [&>span]:flex-1 [&>span]:rounded-full [&>span]:bg-[var(--surface-badge)] [&>span.is-filled]:bg-[var(--project-progress)]"
      filledClassName="is-filled"
    />
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-[12px]">
      <dt className="flex min-w-0 items-center gap-[10px] text-[14px] text-[var(--text-secondary)]">
        <Icon size={20} aria-hidden="true" />
        {label}
      </dt>
      <dd className="min-w-0 break-words text-right text-[15px] font-semibold">{value}</dd>
    </div>
  );
}

function StatusMenu({
  statusMenuRef,
  projectStatus,
  isStatusMenuOpen,
  isStatusUpdating,
  currentStatusLabel,
  STATUS_OPTIONS,
  onToggle,
  onChange,
}: {
  statusMenuRef: React.RefObject<HTMLDivElement | null>;
  projectStatus: ProjectStatus | null;
  isStatusMenuOpen: boolean;
  isStatusUpdating: boolean;
  currentStatusLabel: string;
  STATUS_OPTIONS: { key: ProjectStatus; label: string }[];
  onToggle: () => void;
  onChange: (status: ProjectStatus) => void;
}) {
  return (
    <div ref={statusMenuRef} className="relative flex-[2]">
      <button
        type="button"
        onClick={onToggle}
        disabled={isStatusUpdating}
        className={`inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[10px] font-medium text-[14px] text-white ${
          projectStatus === 'COMPLETED'
            ? 'bg-[var(--ui-400)]'
            : projectStatus === 'IN_PROGRESS'
              ? 'bg-[#22C55E]'
              : 'bg-[#6654F5]'
        }`}
      >
        {isStatusUpdating ? '변경 중...' : currentStatusLabel}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isStatusMenuOpen && (
        <div
          className="absolute z-20 mt-2 w-full rounded-[12px] py-2 shadow-[0_12px_30px_rgba(0,0,0,0.15)]"
          style={{
            backgroundColor: '#212328',
            border: `1px solid ${'#41444D'}`,
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] transition-colors ${
                projectStatus === option.key ? 'font-semibold' : 'hover:bg-[var(--ui-100)]'
              }`}
              style={{
                color:
                  projectStatus === option.key ? '#6654F5' : '#F8F9FB',
              }}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  option.key === 'RECRUITING'
                    ? 'bg-[#6654F5]'
                    : option.key === 'IN_PROGRESS'
                      ? 'bg-[#22C55E]'
                      : 'bg-[var(--ui-400)]'
                }`}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
