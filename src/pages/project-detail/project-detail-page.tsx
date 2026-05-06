import { isChatApiError } from '@apis/chat';
import type { ProjectStatus } from '@apis/project-detail';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import PersonIcon from '@assets/icons/person.svg?react';
import ProfilePlaceholderIcon from '@assets/icons/profile-placeholder.svg?react';
import TalkBalloonIcon from '@assets/icons/detail-page/talkBalloon.svg?react';
import BookmarkButton from '@components/common/BookmarkButton';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useAuth } from '@clerk/clerk-react';
import { getTechBadgeByName } from '@constants/position-tech-stack';
import { CHAT_ROOMS_QUERY_KEY } from '@hooks/useChatRooms';
import { useCreateOrGetChatRoom } from '@hooks/useCreateOrGetChatRoom';
import { useThemeStore } from '@store/theme';
import { useChatWidgetStore } from '@store/chatWidget';
import type { ChatRoomsListData } from '@t/chat';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { BadgeTone } from 'src/shared/types/badgeTone';
import { badgeToneToClass } from 'src/shared/types/badgeTone';
import ApplyModal from './components/ApplyModal';
import ImageLightbox from './components/ImageLightbox';
import LoginModal from './components/LoginModal';
import { useProjectDetail } from './hooks/useProjectDetail';

// ── Small components ──

const RoleBadge = ({ label, tone }: { label: string; tone: BadgeTone }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-[12px] ${badgeToneToClass[tone]}`}
  >
    {label}
  </span>
);

// ── Main ──

const ProjectDetailPage = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const {
    projectId,
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
  const createRoomMutation = useCreateOrGetChatRoom();

  const creatorNick = project?.creatorName?.trim() ?? '';
  const { data: creatorProfileRes } = useQuery({
    ...myInfoQueries.memberProfile(creatorNick),
    enabled: Boolean(creatorNick && !isOwner),
  });
  const creatorProfile = creatorProfileRes?.result;

  const handleContactClick = useCallback(async () => {
    if (!isSignedIn) {
      window.alert('로그인 후 이용해 주세요.');
      return;
    }
    const clerkId = creatorProfile?.member?.clerkId?.trim();
    if (!clerkId) {
      window.alert('채팅을 시작할 수 없어요. 회원 정보가 아직 연결되지 않았습니다.');
      return;
    }
    try {
      const room = await createRoomMutation.mutateAsync({ targetClerkId: clerkId });
      queryClient.setQueryData<ChatRoomsListData>(CHAT_ROOMS_QUERY_KEY, (prev) => {
        const rooms = prev?.rooms ?? [];
        const summary = {
          roomId: room.roomId,
          lastMessage: null,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          otherMember: room.otherMember,
        };
        return {
          rooms: [summary, ...rooms.filter((r) => r.roomId !== summary.roomId)],
        };
      });
      useChatWidgetStore.getState().requestOpenRoom(room.roomId);
    } catch (e) {
      const msg = isChatApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : '채팅방을 열 수 없어요.';
      window.alert(msg);
    }
  }, [createRoomMutation, isSignedIn, creatorProfile?.member?.clerkId, queryClient]);

const isApply = appliedStatus === 'PENDING' || appliedStatus === 'PROCESSING';
const isAccepted = appliedStatus === 'COMPLETED';
const canApply = appliedStatus == null || appliedStatus === 'CANCELLED';

  const renderTechBadge = (tech: string, key: string) => {
    const badge = getTechBadgeByName(tech);
    if (!badge) {
      return (
        <span
          key={key}
          className="inline-flex items-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-100)] px-3 py-1 text-[var(--ui-800)] text-sm"
        >
          {tech}
        </span>
      );
    }
    const src = isDark ? (badge.offDark ?? badge.off) : badge.off;
    return <img key={key} src={src} alt={`${tech} 배지`} className="h-12 w-auto" loading="lazy" />;
  };

  // ── Early returns ──

  if (!projectId || (!project && !isLoading)) {
    return <div>프로젝트 정보를 찾을 수 없습니다.</div>;
  }
  if (!project) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ── Render ──
  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 px-5 pt-10 pb-50">
      {/* 프로젝트 상세 카드 */}
      <section className="flex flex-col gap-14 rounded-3xl bg-card-bg">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-12">
            {/* 이미지 갤러리 */}
            {(project.imageUrls?.length ?? 0) > 0 && (
              <div
                className={`-mt-10 grid grid-cols-1 gap-4 ${
                  project.imageUrls!.length === 1
                    ? 'place-items-center'
                    : project.imageUrls!.length >= 3
                      ? 'lg:grid-cols-3'
                      : 'lg:grid-cols-2'
                }`}
              >
                {project.imageUrls!.map((imageUrl, index) => (
                  <button
                    type="button"
                    key={`project-image-${index}`}
                    onClick={() => setImageLightboxIndex(index)}
                    className={`group relative aspect-[4/3] max-h-[220px] min-h-[140px] w-full overflow-hidden rounded-2xl border border-[var(--ui-200)] bg-card-section-bg text-left shadow-md transition-shadow duration-200 hover:border-[var(--ui-300)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--ui-400)] focus:ring-offset-2 focus:ring-offset-[var(--card-bg)] ${
                      project.imageUrls!.length === 1 ? 'max-h-[250px] max-w-[600px]' : ''
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={
                        project.imageUrls!.length === 1
                          ? `${project.title} 대표 이미지`
                          : `${project.title} 이미지 ${index + 1}`
                      }
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 제목 + 크리에이터 + 지원/수정 버튼 */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="max-w-[800px] font-semibold text-[26px] text-card-title lg:text-[28px]">
                    {project.title}
                  </h1>
                  <BookmarkButton
                    bookmarked={bookmarkState.bookmarked}
                    onBookmarkChange={handleBookmarkChange}
                    className="mt-2 ml-auto h-[48px] w-[48px] shrink-0"
                    iconClassName="h-[28px] w-[28px]"
                    colorIconClassName="h-[48px] w-[48px]"
                    aria-label="북마크"
                  />
                </div>
                <div className="flex items-center gap-3 text-card-muted">
                  {creatorImage ? (
                    <img
                      src={creatorImage}
                      alt={project.creatorName ?? '프로필 이미지'}
                      className="h-12 w-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card-section-bg">
                      <ProfilePlaceholderIcon className="h-142 w-12 text-card-muted" aria-hidden />
                    </div>
                  )}
                  <span className="font-semibold text-2xl text-[var(--ui-1000)]">
                    {project.creatorName ?? '닉네임'}
                  </span>
                </div>

                {/* 지원 수정 (지원자) */}
                {!isOwner && isApply && (
                  <button
                    type="button"
                    onClick={() => {
                      if (appliedPart) setSelectedRole(appliedPart);
                      setIsApplyModalOpen(true);
                      setIsRoleMenuOpen(false);
                    }}
                    className="mt-2 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-100)] font-medium text-[14px] text-[var(--ui-500)]"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    지원 파트 변경하기
                  </button>
                )}

                {/* 수정 + 상태변경 (오너) */}
                {isOwner && (
                  <div className="mt-2 flex w-full items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/project/create', {
                          state: { projectId: Number(project.id), mode: 'edit' },
                        })
                      }
                      className="inline-flex h-[36px] flex-[3] items-center justify-center gap-2 rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-100)] font-medium text-[14px] text-[var(--ui-500)]"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                      프로젝트 수정
                    </button>
                    {isOwner && (
                      <StatusMenu
                        isDark={isDark}
                        statusMenuRef={statusMenuRef}
                        projectStatus={projectStatus}
                        isStatusMenuOpen={isStatusMenuOpen}
                        isStatusUpdating={isStatusUpdating}
                        currentStatusLabel={currentStatusLabel}
                        STATUS_OPTIONS={STATUS_OPTIONS}
                        onToggle={() => setIsStatusMenuOpen((prev) => !prev)}
                        onChange={handleStatusChange}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-card-border" />
          </div>

          {/* 우측 버튼 */}
          <div>
            {!isOwner && (
              <div className="flex w-[200px] flex-col gap-2">
                <button
                  type="button"
                  disabled={createRoomMutation.isPending}
                  onClick={() => {
                    void handleContactClick();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-ui-100 py-[1.4rem] text-xl font-medium text-ui-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TalkBalloonIcon /> {createRoomMutation.isPending ? '연결 중…' : '연락하기'}
                </button>
                {/* PENDING/미지원/취소됨 → 지원하기 */}
                {canApply && (
                  <button
                    type="button"
                    onClick={openApplyModal}
                    className="h-[42px] w-full cursor-pointer rounded-[10px] bg-[#4E49FF] font-medium text-[14px] text-white transition hover:opacity-80"
                  >
                    지원하기
                  </button>
                )}

                {/* PROCESSING → 취소하기 */}
                {isApply && (
                  <button
                    type="button"
                    onClick={handleCancelApply}
                    className="h-[42px] w-full cursor-pointer rounded-[10px] bg-[#4E49FF] font-medium text-[14px] text-white transition hover:opacity-80"
                  >
                    지원 취소하기
                  </button>
                )}

                {/* COMPLETED → 수락 완료 */}
                {isAccepted && (
                  <button
                    type="button"
                    disabled
                    className="h-[42px] w-full cursor-pointer rounded-[10px] bg-[#4E49FF] font-medium text-[14px] text-white transition hover:opacity-80"
                  >
                    수락 완료
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 프로젝트 메타 정보 */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="grid gap-x-20 gap-y-8 text-card-muted lg:grid-cols-2">
              <MetaRow label="프로젝트 유형" value={project.categoryLabel ?? '모바일/앱'} />
              <MetaRow label="도메인" value={project.deadlineLabel ?? '추후 결정 예정'} />
              <MetaRow label="진행 장소" value={project.location ?? '추후 결정 예정'} />
              <MetaRow label="진행 방식" value={project.mode ?? '온라인/오프라인'} />
              <MetaRow label="진행 기간" value={project.period ?? '추후 결정 예정'} />
              <MetaRow label="모집 마감일" value={project.dueLabel ?? '추후 결정 예정'} />
            </div>

            {/* 모집 분야 */}
            <section className="mt-4 flex flex-col gap-8">
              <h2
                className="font-medium text-[15px]"
                style={{ color: isDark ? '#7F8596' : '#939AAE' }}
              >
                모집 분야
              </h2>
              {project.roles?.length ? (
                project.roles.map((role) => (
                  <div key={role.key} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <RoleBadge label={role.label} tone={role.tone} />
                      <span className="flex items-center gap-1 font-semibold text-[12px]">
                        <PersonIcon
                          className="h-5 w-5"
                          style={{ color: isDark ? '#D4DAE7' : '#41444D' }}
                          aria-hidden
                        />
                        <span className="flex items-center">
                          <span style={{ color: isDark ? '#D4DAE7' : '#41444D' }}>
                            {role.current}
                          </span>
                          <span style={{ color: isDark ? '#7F8596' : '#939AAE' }}>
                            /{role.total}명
                          </span>
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(role.techStacks) && role.techStacks.length > 0 ? (
                        role.techStacks.map((tech) => renderTechBadge(tech, `${role.key}-${tech}`))
                      ) : (
                        <span className="text-card-muted text-sm">기술 스택 정보 없음</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-card-muted text-sm">모집 정보가 없습니다.</span>
              )}
            </section>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      {/* 프로젝트 소개 */}
      <section className="grid gap-6 pt-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="font-semibold text-2xl text-card-title">프로젝트 소개</div>
          <div className="flex items-center">
            <span className="h-[2px] w-35 bg-[var(--color-card-title)]" />
            <span className="h-[1.5px] flex-1 bg-[var(--color-card-border)]" />
          </div>
          <div
            className="max-w-[880px] text-2xl text-card-title leading-relaxed [&_a]:text-badge-text-primary [&_a]:underline [&_em]:italic [&_h1]:my-2 [&_h1]:font-bold [&_h1]:text-2xl [&_h2]:my-2 [&_h2]:font-bold [&_h2]:text-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:text-xl [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{
              __html: project.summary?.trim() || '<p>프로젝트 소개 정보가 없습니다.</p>',
            }}
          />
        </div>
        <div className="hidden lg:block" />
      </section>

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
          isDark={isDark}
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
          isDark={isDark}
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
      <span className="text-[15px]">{label}</span>
      <span className="font-semibold text-[15px] text-card-title">{value}</span>
    </div>
  );
}

function StatusMenu({
  isDark,
  statusMenuRef,
  projectStatus,
  isStatusMenuOpen,
  isStatusUpdating,
  currentStatusLabel,
  STATUS_OPTIONS,
  onToggle,
  onChange,
}: {
  isDark: boolean;
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
              : 'bg-[#4E49FF]'
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
            backgroundColor: isDark ? '#212328' : '#FFFFFF',
            border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
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
                  projectStatus === option.key ? '#4E49FF' : isDark ? '#F8F9FB' : 'var(--ui-700)',
              }}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  option.key === 'RECRUITING'
                    ? 'bg-[#4E49FF]'
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
