import ProjectContentEditor from './project-content-editor';
import { useProjectContentEditor } from './use-project-content-editor';
import { getMyProjectsCacheKey } from '@utils/storage';
import { uploadProjectImage } from '@apis/images';
import { getProjectDetail } from '@apis/project-detail';
import { createProject, updateProject } from '@apis/projects';
import PlusIcon from '@assets/icons/create-project/plus.svg?react';
import UnderVectorIcon from '@assets/icons/create-project/under-vector.svg?react';
import XIcon from '@assets/icons/create-project/x.svg?react';
import { useAuth } from '@clerk/clerk-react';
import DatePickerPopover from '@components/common/DatePickerPopover';
import TechStackPicker from '@components/common/TechStackPicker';
import SelectDropdown from '@components/common/SelectDropdown';
import {
  type PositionKey,
  TECH_STACK_LABEL_BY_KEY,
} from '@constants/position-tech-stack';
import { createProjectDraftStore, type RecruitmentItem } from './project-draft.store';
import { useStore } from 'zustand';
import type { ChangeEvent, Ref } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { MY_RECRUITING_PROJECTS_QUERY_KEY } from '@hooks/useMyRecruitingProjects';
import { cn } from '@libs/cn';
import { fromProjectResponse, toProjectRequest } from './project-form-mapper';
import { PROJECT_FORM_FIELD_ORDER, validateProjectForm, type ProjectFormFieldKey } from './project-form-validation';
import './project-create-colors.css';


const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const recruitCountOptions = Array.from({ length: 8 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}명`,
}));

function Label({ children }: { children: string }) {
  return <p className="Headline1 font-medium text-[var(--ui-700)]">{children}</p>;
}

function SubLabel({ children }: { children: string }) {
  return <p className="Label1 font-medium text-[var(--ui-700)]">{children}</p>;
}

function InputField({
  placeholder,
  value,
  onChange,
  error,
  inputRef,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  error?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
    <input
      ref={inputRef}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className={cn(
        'Caption1 h-[48px] w-full rounded-[12px] border bg-[var(--ui-50)] px-[12px] font-medium text-[var(--ui-900)] tracking-[0.0912px] transition-colors placeholder:text-[var(--ui-300)] focus:outline-none',
        error
          ? 'border-form-error focus:border-[var(--project-create-accent,#6654F5)]'
          : 'border-[var(--ui-200)] focus:border-[var(--project-create-accent,#6654F5)]',
      )}
    />
  );
}

function ImageSlot({
  label,
  inputId,
  previewUrl,
  onChange,
  onRemove,
  loading,
}: {
  label: string;
  inputId: string;
  previewUrl: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  loading?: boolean;
}) {

  const AddImageIcon = PlusIcon;

  return (
    <label
      htmlFor={loading ? undefined : inputId}
      className="relative block h-[166px] w-[296px] cursor-pointer overflow-hidden rounded-[12px] bg-ui-50 data-[loading]:pointer-events-none"
      data-loading={loading ? true : undefined}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onChange}
        disabled={loading}
      />

      {loading ? (
        <div className="flex h-full w-full items-center justify-center text-ui-400">
          <span className="Caption1">업로드 중...</span>
        </div>
      ) : previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt={label}
            className="h-full w-full bg-[var(--ui-50)] object-contain"
            draggable={false}
          />
          <button
            type="button"
            aria-label="사진 삭제"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove?.();
            }}
            className="absolute top-[10px] right-[10px] inline-flex h-[24px] w-[24px] items-center justify-center rounded-full border border-ui-200 bg-ui-bg/70 text-ui-700 backdrop-blur-[2px] hover:bg-ui-bg/85"
          >
            <XIcon aria-hidden className="h-[10px] w-[10px]" />
          </button>
        </>
      ) : (
        <>
          <p className="Body1 -translate-x-1/2 absolute top-[31px] left-1/2 w-[150px] text-center font-medium text-ui-400">
            {label}
          </p>
          <div className="-translate-x-1/2 absolute top-[75px] left-1/2 flex h-[44px] w-[44px] flex-row items-center justify-center overflow-hidden rounded-full">
            <AddImageIcon aria-hidden className="h-[40px] w-[40px]" />
          </div>
        </>
      )}
    </label>
  );
}

const ProjectCreatePage = () => {
  const { userId } = useAuth();
  const { state } = useLocation();
  const routeState = state as { projectId?: number; mode?: string } | null;
  const editProjectId = routeState?.mode === 'edit' ? routeState.projectId ?? null : null;
  const formKey = `${userId ?? 'guest'}:${editProjectId ?? 'create'}`;

  return <ProjectForm key={formKey} ownerId={userId ?? undefined} editProjectId={editProjectId} />;
};

function ProjectForm({ ownerId, editProjectId }: { ownerId?: string; editProjectId: number | null }) {
  const isDev = Boolean((import.meta as any).env?.DEV);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = editProjectId !== null;
  const [draftStore] = useState(() => createProjectDraftStore(isEditMode ? undefined : ownerId));
  const [editDataLoaded, setEditDataLoaded] = useState(false);

  const {
    locationText,
    setLocationText,
    deadlineText,
    setDeadlineText,
    projectTitle,
    setProjectTitle,
    projectContent,
    setProjectContent,
    projectFeatures,
    setProjectFeatures,
    projectType,
    setProjectType,
    domain,
    setDomain,
    progressType,
    setProgressType,
    progressPeriod,
    setProgressPeriod,
    recruitPosition,
    setRecruitPosition,
    recruitCount,
    setRecruitCount,
    techStack,
    setTechStack,
    recruitments,
    setRecruitments,
    slotImages,
    setSlotImages,
    clearDraft,
  } = useStore(draftStore);

  const [techStackOpen, setTechStackOpen] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const addProjectFeature = () => {
    const value = featureInput.trim();
    if (!value) return;
    setProjectFeatures([...projectFeatures.split('\n').filter(Boolean), value].join('\n'));
    setFeatureInput('');
  };
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProjectFormFieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fieldRefs = useRef<Partial<Record<ProjectFormFieldKey, HTMLElement | null>>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);
  const submitAreaRef = useRef<HTMLDivElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageUploadingSlot, setImageUploadingSlot] = useState<number | null>(null);

  const minDeadline = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const fieldRefCallbacks = useMemo(() => {
    const out = {} as Record<ProjectFormFieldKey, (el: HTMLElement | null) => void>;
    for (const key of PROJECT_FORM_FIELD_ORDER) {
      out[key] = (el: HTMLElement | null) => {
        fieldRefs.current[key] = el;
      };
    }
    return out;
  }, []);

  const clearFieldError = useCallback((key: ProjectFormFieldKey) => {
    setFieldErrors((prev) => {
      if (prev[key] == null) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const onPickImage = useMemo(() => {
    return (index: number) => async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      const token = await getToken();
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }
      setImageUploadingSlot(index);
      try {
        const { imageId, imageUrl } = await uploadProjectImage(file, token);
        setSlotImages((prev) => {
          const next = [...prev];
          next[index] = { imageId, imageUrl };
          return next as [(typeof prev)[0], (typeof prev)[1], (typeof prev)[2]];
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
        console.error('[project-create] slot image upload failed', msg, err);
        alert(msg);
      } finally {
        setImageUploadingSlot(null);
      }
    };
  }, [getToken, isDev]);

  const onRemoveImage = useMemo(() => {
    return (index: number) => () => {
      setSlotImages((prev) => {
        const next = [...prev];
        next[index] = null;
        return next as [(typeof prev)[0], (typeof prev)[1], (typeof prev)[2]];
      });
    };
  }, []);

  const positionKey = useMemo<PositionKey | null>(() => {
    if (recruitPosition === '프론트엔드') return 'frontend';
    if (recruitPosition === '백엔드') return 'backend';
    if (recruitPosition === '인프라') return 'infra';
    return null;
  }, [recruitPosition]);

  const savedCount = recruitCount?.replace(/명$/, '');
  const selectedRecruitCount = recruitCountOptions.find(({ value }) => value === savedCount)?.value ?? null;

  const addCompleteRecruitment = (position: string | null, count: string | null, stackKeys: string[]) => {
    if (!position || !count || stackKeys.length === 0) return;

    const nextItem: RecruitmentItem = {
      id: makeId(),
      positionLabel: position,
      countLabel: `${count}명`,
      techStackKeys: stackKeys,
    };
    setRecruitments((prev) => {
      const same = prev.some((item) =>
        item.positionLabel === position &&
        item.countLabel === nextItem.countLabel &&
        item.techStackKeys.length === stackKeys.length &&
        stackKeys.every((key) => item.techStackKeys.includes(key)),
      );
      return same ? prev : [...prev, nextItem];
    });

    clearFieldError('recruitments');
    setRecruitPosition(null);
    setRecruitCount(null);
    setTechStack([]);
  };

  const handleRecruitCountChange = (value: string) => {
    setRecruitCount(value);
    addCompleteRecruitment(recruitPosition, value, techStack);
  };

  const handleRecruitPositionChange = (position: string) => {
    if (position !== recruitPosition) setTechStack([]);
    setRecruitPosition(position);
  };

  const handleRecruitStackApply = (stackKeys: string[]) => {
    setTechStack(stackKeys);
    addCompleteRecruitment(recruitPosition, selectedRecruitCount, stackKeys);
  };

  const onRemoveRecruitment = (id: string) => {
    setRecruitments((prev) => prev.filter((r) => r.id !== id));
  };

  const { editor, editorImageUploading, editorImageInputRef, onToolbarPickImage, onToolbarLink, insertImageFromFile } = useProjectContentEditor({ projectContent, setProjectContent, setFieldErrors, isEditMode, getToken });

  useEffect(() => {
    if (!isEditMode || !editProjectId || editDataLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const project = await getProjectDetail(editProjectId, token);
        if (cancelled || !project) return;

        const form = fromProjectResponse(project, makeId);
        setProjectTitle(form.title);
        setProjectContent(form.summary);
        setProjectFeatures(form.features);
        setLocationText(form.location);
        setDeadlineText(form.deadline);
        if (form.projectType !== undefined) setProjectType(form.projectType);
        if (form.domain !== undefined) setDomain(form.domain);
        if (form.progressType !== undefined) setProgressType(form.progressType);
        if (form.progressPeriod !== undefined) setProgressPeriod(form.progressPeriod);
        if (form.recruitments) setRecruitments(form.recruitments);
        if (form.slotImages) setSlotImages(form.slotImages);

        if (editor && project.content) {
          editor.commands.setContent(form.summary, { emitUpdate: false });
        }

        setEditDataLoaded(true);
      } catch (e) {
        console.error('[project-edit] 기존 데이터 불러오기 실패', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, editProjectId, editDataLoaded, editor, getToken]);

  const handleSubmit = async () => {
    if (isDev) console.log('[project-create] handleSubmit called');
    setSubmitError(null);

    const nextErrors = validateProjectForm({
      projectType, domain, progressType, progressPeriod, locationText, deadlineText,
      recruitments, projectTitle,
      contentEmpty: !editor || editor.isEmpty || editor.getText().replace(/\u00a0/g, ' ').trim().length === 0,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      const firstKey = PROJECT_FORM_FIELD_ORDER.find((k) => nextErrors[k]);
      requestAnimationFrame(() => {
        if (firstKey) fieldRefs.current[firstKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstKey === 'title') titleInputRef.current?.focus();
        if (firstKey === 'content') editor?.chain().focus().run();
      });
      return;
    }

    setFieldErrors({});

    const token = await getToken();
    if (!token) {
      if (isDev) console.log('[project-create] blocked: no token');
      setSubmitError('로그인이 필요합니다.');
      requestAnimationFrame(() => {
        submitAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setSubmitLoading(true);
    try {
      if (isDev) {
        console.groupCollapsed('[project-create] submit');
        console.log('projectTitle', projectTitle);
        console.log('projectType', projectType);
        console.log('progressType', progressType);
        console.log('progressPeriod', progressPeriod);
        console.log('locationText', locationText);
        console.log('deadlineText', deadlineText);
        console.log('recruitments(ui)', recruitments);
        console.log('techStack(keys)', techStack);
      }
      const body = toProjectRequest({
        projectType, domain, progressType, progressPeriod, locationText, deadlineText,
        recruitments, projectTitle, projectContent, projectFeatures, slotImages,
      });
      if (isDev) {
        console.log('createProject body(final)', body);
        console.groupCollapsed('[project-create] techStacks — 백엔드 enum과 비교용');
        recruitments.forEach((r, i) => {
          const sent = body.recruitments[i].techStacks;
          console.log(
            `recruitments[${i}] ${r.positionLabel}: UI keys = [${r.techStackKeys.join(', ')}] → API로 전송 = [${sent.join(', ')}]`,
          );
        });
        console.log(
          '→ 백엔드 Swagger/API의 tech stack enum 목록과 위 "API로 전송" 값이 일치해야 합니다.',
        );
        console.groupEnd();
      }
      const result =
        isEditMode && editProjectId
          ? await updateProject(editProjectId, body, token)
          : await createProject(body, token);

      try {
        await queryClient.invalidateQueries({ queryKey: MY_RECRUITING_PROJECTS_QUERY_KEY });
      } catch {}
      if (ownerId) {
        try {
          const cacheKey = getMyProjectsCacheKey(ownerId);
          const raw = localStorage.getItem(cacheKey);
          const parsed = raw ? (JSON.parse(raw) as unknown) : [];
          const prev = Array.isArray(parsed) ? parsed : [];
          const rest = prev.filter((p: any) => Number(p?.id) !== result.projectId);
          const next = [{ id: result.projectId, name: body.title.trim() }, ...rest].filter(
            (p: any) => Number.isFinite(Number(p?.id)) && String(p?.name ?? '').trim().length > 0,
          );
          localStorage.setItem(cacheKey, JSON.stringify(next));
        } catch {}
      }

      clearDraft();
      if (isEditMode) {
        navigate(`/project/${result.projectId}`, { replace: true });
      } else {
        navigate('/project/create/complete', { state: { projectId: result.projectId } });
      }
    } catch (e) {
      if (isDev) {
        console.error('[project-create] submit failed', e);
      }
      const message = e instanceof Error ? e.message : '등록에 실패했습니다.';
      const needSignup = /가입|등록|미등록|사용자|member|unauthorized/i.test(message);
      const needPm = /PM|권한|프로젝트를 생성/i.test(message);
      const detail = needSignup
        ? `${message} (백엔드에 회원으로 등록되어 있지 않을 수 있습니다. 회원가입 완료 후 다시 시도해 주세요.)`
        : needPm
          ? `${message} (메인 권한을 PM으로 설정한 뒤 시도해 주세요.)`
          : message;
      setSubmitError(detail);
      requestAnimationFrame(() => {
        submitAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } finally {
      if (isDev) console.groupEnd();
      setSubmitLoading(false);
    }
  };

  return (
    <div className="project-create-colors -mx-6 -my-8">
      <section className="bg-[var(--ui-bg)]">
        <div className="mx-auto desktop-content w-[var(--desktop-content-width,100%)] max-w-[1018px] lg:max-2xl:max-w-[clamp(850px,68vw,990px)] px-6 py-[32px] lg:max-2xl:py-[24px]">
          <h1 className="text-[32px] leading-tight font-bold tracking-tight text-[var(--ui-900)] sm:text-[38px]">
            {isEditMode ? '프로젝트 수정' : '프로젝트 등록'}
          </h1>
          <p className="mt-[10px] text-[16px] leading-relaxed text-[var(--text-secondary)] sm:text-[18px]">
            {isEditMode ? '프로젝트 정보를 수정하고 업데이트해 보세요.' : '프로젝트를 등록하고 함께 성장할 개발자들을 만나보세요.'}
          </p>
        </div>
      </section>

      <section className="-translate-x-1/2 relative left-1/2 w-screen bg-[var(--surface-page)] pt-[32px] pb-[64px] lg:max-2xl:pt-[24px]">
        <div className="mx-auto desktop-content w-[var(--desktop-content-width,100%)] max-w-[1018px] lg:max-2xl:max-w-[clamp(850px,68vw,990px)] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-6 py-[40px] lg:max-2xl:py-[28px]">
          <div className="mx-auto w-full max-w-[922px]">
            <div className="flex flex-col gap-[64px] lg:max-2xl:gap-[clamp(44px,6svh,56px)]">
              <section className="flex flex-col gap-[40px] lg:max-2xl:gap-[32px]">
                <h2 className="Heading2 font-semibold text-[var(--ui-900)]">
                  1. 프로젝트 정보를 입력해주세요
                </h2>

                <div className="flex flex-col gap-[40px] lg:max-2xl:gap-[30px]">
                  <div className="grid w-full grid-cols-2 gap-x-[240px] gap-y-[32px] lg:max-2xl:gap-y-[24px] min-[1100px]:max-2xl:gap-x-[clamp(48px,10vw,144px)] max-[1100px]:grid-cols-1 max-[1100px]:gap-x-0">
                    <div
                      ref={fieldRefCallbacks.projectType}
                      className="flex w-[320px] max-w-full flex-col gap-[16px] lg:max-2xl:gap-[12px] max-[1100px]:w-full"
                    >
                      <Label>프로젝트 유형</Label>
                      <SelectDropdown
                        placeholder="프로젝트 유형"
                        value={projectType}
                        error={!!fieldErrors.projectType}
                        onChange={(v) => {
                          clearFieldError('projectType');
                          setProjectType(v);
                        }}
                        options={[
                          { label: '웹', value: '웹' },
                          { label: '모바일/앱', value: '모바일/앱' },
                          { label: '게임', value: '게임' },
                          { label: '블록체인', value: '블록체인' },
                          { label: '기타', value: '기타' },
                        ]}
                      />
                      {fieldErrors.projectType ? (
                        <p className="Caption1 -mt-2 text-form-error">{fieldErrors.projectType}</p>
                      ) : null}
                    </div>

                    <div
                      ref={fieldRefCallbacks.domain}
                      className="flex w-[320px] max-w-full flex-col gap-[16px] lg:max-2xl:gap-[12px] max-[1100px]:w-full"
                    >
                      <Label>도메인</Label>
                      <SelectDropdown
                        placeholder="도메인"
                        value={domain}
                        error={!!fieldErrors.domain}
                        onChange={(v) => {
                          clearFieldError('domain');
                          setDomain(v);
                        }}
                        options={[
                          { label: '헬스케어', value: '헬스케어' },
                          { label: '핀테크', value: '핀테크' },
                          { label: '이커머스', value: '이커머스' },
                          { label: '교육', value: '교육' },
                          { label: '소셜/커뮤니티', value: '소셜/커뮤니티' },
                          { label: '엔터테인먼트', value: '엔터테인먼트' },
                          { label: 'AI/데이터', value: 'AI/데이터' },
                          { label: '기타', value: '기타' },
                        ]}
                      />
                      {fieldErrors.domain ? (
                        <p className="Caption1 -mt-2 text-form-error">{fieldErrors.domain}</p>
                      ) : null}
                    </div>

                    <div
                      ref={fieldRefCallbacks.progressType}
                      className="flex w-[320px] max-w-full flex-col gap-[16px] lg:max-2xl:gap-[12px] max-[1100px]:w-full"
                    >
                      <Label>진행 방식</Label>
                      <SelectDropdown
                        placeholder="진행 방식"
                        value={progressType}
                        error={!!fieldErrors.progressType}
                        onChange={(v) => {
                          clearFieldError('progressType');
                          setProgressType(v);
                        }}
                        options={[
                          { label: '온/오프라인', value: '온/오프라인' },
                          { label: '온라인', value: '온라인' },
                          { label: '오프라인', value: '오프라인' },
                        ]}
                      />
                      {fieldErrors.progressType ? (
                        <p className="Caption1 -mt-2 text-form-error">{fieldErrors.progressType}</p>
                      ) : null}
                    </div>

                    <div
                      ref={fieldRefCallbacks.progressPeriod}
                      className="flex w-[320px] max-w-full flex-col gap-[16px] lg:max-2xl:gap-[12px] max-[1100px]:w-full"
                    >
                      <Label>진행 기간</Label>
                      <SelectDropdown
                        placeholder="진행 기간"
                        value={progressPeriod}
                        error={!!fieldErrors.progressPeriod}
                        onChange={(v) => {
                          clearFieldError('progressPeriod');
                          setProgressPeriod(v);
                        }}
                        options={[
                          { label: '1개월 이하', value: '1개월 이하' },
                          { label: '1-3개월', value: '1-3개월' },
                          { label: '3-6개월', value: '3-6개월' },
                          { label: '6개월 이상', value: '6개월 이상' },
                        ]}
                      />
                      {fieldErrors.progressPeriod ? (
                        <p className="Caption1 -mt-2 text-form-error">{fieldErrors.progressPeriod}</p>
                      ) : null}
                    </div>

                    <div
                      ref={fieldRefCallbacks.location}
                      className="flex w-[320px] max-w-full flex-col gap-[16px] lg:max-2xl:gap-[12px] max-[1100px]:w-full"
                    >
                      <Label>진행 장소</Label>
                      <InputField
                        placeholder="서울시 중구"
                        value={locationText}
                        error={!!fieldErrors.location}
                        onChange={(v) => {
                          clearFieldError('location');
                          setLocationText(v);
                        }}
                      />
                      {fieldErrors.location ? (
                        <p className="Caption1 -mt-2 text-form-error">{fieldErrors.location}</p>
                      ) : null}
                    </div>

                    <div
                      ref={fieldRefCallbacks.deadline}
                      className="flex w-[320px] max-w-full flex-col gap-[16px] lg:max-2xl:gap-[12px] max-[1100px]:w-full"
                    >
                      <Label>모집 마감일</Label>
                      <DatePickerPopover
                        value={deadlineText}
                        error={!!fieldErrors.deadline}
                        onChange={(v) => {
                          clearFieldError('deadline');
                          setDeadlineText(v);
                        }}
                        min={minDeadline}
                        placeholder="연도-월-일"
                      />
                      {fieldErrors.deadline ? (
                        <p className="Caption1 -mt-2 text-form-error">{fieldErrors.deadline}</p>
                      ) : null}
                    </div>
                  </div>

                  <div ref={fieldRefCallbacks.recruitments} className="flex flex-col gap-[20px]">
                    <Label>모집 분야</Label>

                    <div className="flex flex-col gap-[12px]">
                      <div className="flex w-full items-end gap-[16px] max-[1100px]:flex-col max-[1100px]:items-stretch">
                        <div className="flex w-[212px] flex-col gap-[8px] max-[1100px]:w-full">
                          <SubLabel>포지션</SubLabel>
                          <SelectDropdown
                            placeholder="포지션"
                            value={recruitPosition}
                            onChange={handleRecruitPositionChange}
                            options={[
                              { label: '프론트엔드', value: '프론트엔드' },
                              { label: '백엔드', value: '백엔드' },
                              { label: '인프라', value: '인프라' },
                            ]}
                          />
                        </div>

                        <div className="flex w-[212px] flex-col gap-[8px] max-[1100px]:w-full">
                          <SubLabel>모집 인원</SubLabel>
                          <SelectDropdown
                            placeholder="모집 인원"
                            value={selectedRecruitCount}
                            onChange={handleRecruitCountChange}
                            options={recruitCountOptions}
                          />
                        </div>

                        <div className="flex w-[358px] flex-col gap-[8px] max-[1100px]:w-full">
                          <SubLabel>기술 스택</SubLabel>
                          <div className="relative">
                            <button
                              type="button"
                              disabled={!positionKey}
                              aria-haspopup="dialog"
                              aria-label="기술 스택 선택"
                              onClick={() => setTechStackOpen(true)}
                              className={`relative flex h-[44px] w-full items-center rounded-[12px] border bg-ui-bg px-[12px] text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                techStackOpen ? 'border-[var(--project-create-accent,#6654F5)]' : 'border-ui-200'
                              }`}
                            >
                              {techStack.length ? (
                                <span className="Caption1 w-[calc(100%-36px)] truncate font-medium text-ui-900">
                                  {techStack.map((k) => TECH_STACK_LABEL_BY_KEY[k] ?? k).join(', ')}
                                </span>
                              ) : (
                                <span className="Caption1 text-ui-400">
                                  {positionKey ? '기술 스택' : '포지션을 먼저 선택해주세요'}
                                </span>
                              )}
                              <span className="-translate-y-1/2 absolute top-1/2 right-[10px] inline-flex h-[28px] w-[28px] items-center justify-center text-ui-400">
                                <UnderVectorIcon
                                  aria-hidden
                                  className={`h-[9px] w-[16px] transition-transform duration-150 ${
                                    techStackOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </span>
                            </button>

                          </div>
                        </div>
                      </div>
                      {positionKey && techStackOpen && (
                        <TechStackPicker
                          title="기술 스택 선택"
                          description={`${recruitPosition} 모집에 필요한 기술을 선택하세요.`}
                          position={positionKey}
                          value={techStack}
                          onApply={handleRecruitStackApply}
                          onClose={() => setTechStackOpen(false)}
                        />
                      )}

                      <div
                        className={cn(
                          'h-[140px] w-full rounded-[16px] border bg-[var(--ui-bg)] p-[14px]',
                          fieldErrors.recruitments
                            ? 'border-form-error'
                            : 'border-[var(--ui-200)]',
                        )}
                      >
                        {recruitments.length === 0 ? (
                          <p className="Caption1 text-[var(--ui-300)] tracking-[0.0912px]">
                            아직 등록된 모집 분야가 없습니다. 위에서 정보를 입력해 주세요.
                          </p>
                        ) : (
                          <div className="flex max-h-full flex-col gap-[8px] overflow-auto pr-[4px]">
                            {recruitments.map((r) => {
                              const techSummary = r.techStackKeys
                                .map((k) => TECH_STACK_LABEL_BY_KEY[k] ?? k)
                                .join(', ');
                              return (
                                <div
                                  key={r.id}
                                  className="flex h-[38px] items-center justify-between gap-[10px] rounded-full bg-ui-50 px-[14px]"
                                >
                                  <span className="Caption1 w-[calc(100%-36px)] truncate font-medium text-ui-400">
                                    {r.positionLabel} / {r.countLabel} / {techSummary}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label="모집 분야 삭제"
                                    onClick={() => onRemoveRecruitment(r.id)}
                                    className="inline-flex items-center justify-center text-ui-400 hover:text-ui-700"
                                  >
                                    <XIcon
                                      aria-hidden
                                      className="h-[12px] w-[12px] cursor-pointer"
                                    />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {fieldErrors.recruitments ? (
                        <p className="Caption1 text-form-error">{fieldErrors.recruitments}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-[40px] lg:max-2xl:gap-[32px]">
                <h2 className="Heading2 font-semibold text-[var(--ui-900)]">
                  2. 프로젝트 내용을 입력해주세요
                </h2>

                <div className="flex flex-col gap-[40px] lg:max-2xl:gap-[30px]">
                  <div className="relative flex flex-col gap-[12px]">
                    <Label>프로젝트 대표 사진</Label>
                    <div className="flex gap-[12px] max-[1100px]:flex-col">
                      <ImageSlot
                        label="대표 사진 추가하기"
                        inputId="project-image-0"
                        previewUrl={slotImages[0]?.imageUrl ?? null}
                        onChange={onPickImage(0)}
                        onRemove={onRemoveImage(0)}
                        loading={imageUploadingSlot === 0}
                      />
                      <ImageSlot
                        label="사진 추가하기"
                        inputId="project-image-1"
                        previewUrl={slotImages[1]?.imageUrl ?? null}
                        onChange={onPickImage(1)}
                        onRemove={onRemoveImage(1)}
                        loading={imageUploadingSlot === 1}
                      />
                      <ImageSlot
                        label="사진 추가하기"
                        inputId="project-image-2"
                        previewUrl={slotImages[2]?.imageUrl ?? null}
                        onChange={onPickImage(2)}
                        onRemove={onRemoveImage(2)}
                        loading={imageUploadingSlot === 2}
                      />
                    </div>
                  </div>

                  <div
                    ref={fieldRefCallbacks.title}
                    className="flex flex-col gap-[12px]"
                  >
                    <Label>프로젝트 제목</Label>
                    <InputField
                      placeholder="프로젝트 제목을 입력해주세요."
                      value={projectTitle}
                      error={!!fieldErrors.title}
                      inputRef={titleInputRef}
                      onChange={(v) => {
                        clearFieldError('title');
                        setProjectTitle(v);
                      }}
                    />
                    {fieldErrors.title ? (
                      <p className="Caption1 text-form-error">{fieldErrors.title}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <Label>주요 기능</Label>
                    <div className="flex items-stretch gap-[8px]">
                      <input
                        aria-label="추가할 주요 기능"
                        placeholder="예: 팀 일정과 마감일 관리"
                        value={featureInput}
                        onChange={(event) => setFeatureInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
                          event.preventDefault();
                          addProjectFeature();
                        }}
                        className="min-w-0 flex-1 rounded-[12px] border border-[var(--ui-300)] bg-[var(--ui-50)] px-[14px] py-[12px] text-[14px] text-ui-900 outline-none focus:border-[var(--project-accent)]"
                      />
                      <button type="button" disabled={!featureInput.trim()} onClick={addProjectFeature} className="rounded-[12px] border border-[var(--ui-300)] px-[18px] text-[14px] font-medium text-ui-900 hover:bg-[var(--ui-100)] disabled:opacity-40">추가</button>
                    </div>
                    {projectFeatures && (
                      <ul className="overflow-hidden rounded-[12px] border border-[var(--ui-300)] bg-[var(--ui-50)] px-[14px]">
                        {projectFeatures.split('\n').filter(Boolean).map((feature, index) => (
                          <li key={index} className="flex items-center justify-between gap-[12px] border-b border-[var(--ui-300)] py-[11px] text-[14px] text-ui-900 last:border-b-0">
                            <span className="flex min-w-0 items-baseline gap-[10px] break-words"><span aria-hidden="true" className="h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--project-accent)]" />{feature}</span>
                            <button type="button" aria-label={`${feature} 삭제`} onClick={() => setProjectFeatures(projectFeatures.split('\n').filter(Boolean).filter((_, itemIndex) => itemIndex !== index).join('\n'))} className="shrink-0 rounded-md px-[8px] py-[4px] text-[13px] text-ui-500 transition-colors hover:bg-[var(--ui-100)] hover:text-ui-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-accent)]">삭제</button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="Caption1 text-ui-500">프로젝트의 주요 기능을 추가해주세요. 선택 사항입니다.</p>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <Label>프로젝트 내용</Label>

                    <ProjectContentEditor editor={editor} fieldRef={fieldRefCallbacks.content} error={fieldErrors.content}
                      editorImageUploading={editorImageUploading} editorImageInputRef={editorImageInputRef}
                      onToolbarPickImage={onToolbarPickImage} onToolbarLink={onToolbarLink} insertImageFromFile={insertImageFromFile} />
                    {fieldErrors.content ? (
                      <p className="Caption1 text-form-error">{fieldErrors.content}</p>
                    ) : null}
                  </div>

                  <div
                    ref={submitAreaRef}
                    className="flex w-full flex-col items-center justify-center gap-3"
                  >
                    {submitError ? (
                      <p className="Caption1 max-w-[520px] text-center text-form-error">
                        {submitError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={submitLoading}
                      onClick={handleSubmit}
                      className="Body1 h-[48px] w-[270px] cursor-pointer rounded-[12px] bg-[var(--project-create-accent,#6654F5)] font-medium text-[var(--surface-page)] transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-60"
                    >
                      {submitLoading
                        ? isEditMode
                          ? '수정 중...'
                          : '등록 중...'
                        : isEditMode
                          ? '수정하기'
                          : '등록하기'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectCreatePage;
