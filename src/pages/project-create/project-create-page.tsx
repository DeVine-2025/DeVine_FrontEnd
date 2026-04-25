import { confirmImage, getPresignedUrl } from '@apis/images';
import { getProjectDetail } from '@apis/project-detail';
import { createProject, updateProject } from '@apis/projects';
import AddImageLightIcon from '@assets/icons/create-project/addimage-light.svg?react';
import PlusIcon from '@assets/icons/create-project/plus.svg?react';
import TablerIconBold from '@assets/icons/create-project/tabler-icon-bold.svg?react';
import TablerIconBoldHover from '@assets/icons/create-project/tabler-icon-bold-hover.svg?react';
import TablerIconH1 from '@assets/icons/create-project/tabler-icon-h-1.svg?react';
import TablerIconH1Hover from '@assets/icons/create-project/tabler-icon-h-1-hover.svg?react';
import TablerIconH2 from '@assets/icons/create-project/tabler-icon-h-2.svg?react';
import TablerIconH2Hover from '@assets/icons/create-project/tabler-icon-h-2-hover.svg?react';
import TablerIconItalic from '@assets/icons/create-project/tabler-icon-italic.svg?react';
import TablerIconItalicHover from '@assets/icons/create-project/tabler-icon-italic-hover.svg?react';
import TablerIconLink from '@assets/icons/create-project/tabler-icon-link.svg?react';
import TablerIconLinkHover from '@assets/icons/create-project/tabler-icon-link-hover.svg?react';
import TablerIconList from '@assets/icons/create-project/tabler-icon-list.svg?react';
import TablerIconListHover from '@assets/icons/create-project/tabler-icon-list-hover.svg?react';
import TablerIconListNumbers from '@assets/icons/create-project/tabler-icon-list-numbers.svg?react';
import TablerIconListNumbersHover from '@assets/icons/create-project/tabler-icon-list-numbers-hover.svg?react';
import TablerIconPhoto from '@assets/icons/create-project/tabler-icon-photo.svg?react';
import TablerIconPhotoHover from '@assets/icons/create-project/tabler-icon-photo-hover.svg?react';
import TablerIconStrikethrough from '@assets/icons/create-project/tabler-icon-strikethrough.svg?react';
import TablerIconStrikethroughHover from '@assets/icons/create-project/tabler-icon-strikethrough-hover.svg?react';
import TablerIconUnderline from '@assets/icons/create-project/tabler-icon-underline.svg?react';
import TablerIconUnderlineHover from '@assets/icons/create-project/tabler-icon-underline-hover.svg?react';
import UnderVectorIcon from '@assets/icons/create-project/under-vector.svg?react';
import XIcon from '@assets/icons/create-project/x.svg?react';
import { useAuth } from '@clerk/clerk-react';
import DatePickerPopover from './_components/DatePickerPopover';
import PositionBasedTechStackDropdown from './_components/PositionBasedTechStackDropdown';
import SelectDropdown from '@ui/SelectDropdown';
import {
  getKeysByPosition,
  type PositionKey,
  TECH_STACK_LABEL_BY_KEY,
} from '@constants/position-tech-stack';
import { TECHSTACK_KEY_TO_NAME } from '@mappers/projectFilters';
import { LinkCardExtension } from '@pages/project-create/LinkCardNode';
import { type SlotImage, useProjectCreateStore } from '@store/projectCreate';
import { useThemeStore } from '@store/theme';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { ChangeEvent, ComponentType, Ref, SVGProps } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { MY_RECRUITING_PROJECTS_QUERY_KEY } from '@hooks/useMyRecruitingProjects';
import { cn } from '@libs/cn';

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

type RecruitmentItem = {
  id: string;
  positionLabel: string;
  countLabel: string;
  techStackKeys: string[];
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function Label({ children }: { children: string }) {
  return <p className="Headline1 font-medium text-[var(--ui-700)]">{children}</p>;
}

function SubLabel({ children }: { children: string }) {
  return <p className="Label1 font-medium text-[var(--ui-700)]">{children}</p>;
}

function DropdownLike({ placeholder }: { placeholder: string }) {
  return (
    <button
      type="button"
      className="relative flex h-[44px] w-full items-center rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[12px] text-left"
    >
      <span className="Caption1 text-[var(--ui-400)]">{placeholder}</span>
      <span className="-translate-y-1/2 absolute top-1/2 right-[10px] inline-flex h-[28px] w-[28px] items-center justify-center text-[var(--ui-400)]">
        <UnderVectorIcon aria-hidden className="h-[9px] w-[16px]" />
      </span>
    </button>
  );
}

function InputLike({ placeholder, value }: { placeholder: string; value?: string }) {
  return (
    <input
      value={value ?? ''}
      placeholder={placeholder}
      onChange={() => {}}
      className="Caption1 h-[48px] w-full rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-50)] px-[12px] font-medium text-[var(--ui-900)] tracking-[0.0912px] transition-colors placeholder:text-[var(--ui-300)] focus:border-[#4E49FF] focus:outline-none"
    />
  );
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
          ? 'border-form-error focus:border-[#4E49FF]'
          : 'border-[var(--ui-200)] focus:border-[#4E49FF]',
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
  const { theme } = useThemeStore();
  const AddImageIcon = theme === 'light' ? AddImageLightIcon : PlusIcon;

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

function ToolbarButton({
  Icon,
  HoverIcon,
  label,
  onClick,
  onMouseDown,
  active,
  disabled,
}: {
  Icon: SvgIcon;
  HoverIcon: SvgIcon;
  label: string;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown?.(e);
      }}
      onClick={onClick}
      disabled={disabled}
      className="group flex h-[28px] min-w-[28px] items-center justify-center rounded-md px-1 transition-colors hover:bg-[var(--ui-100)] hover:text-[var(--ui-700)] disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-[var(--ui-200)] data-[active]:text-[var(--ui-800)]"
      data-active={active || undefined}
      aria-label={label}
    >
      {active ? (
        <HoverIcon aria-hidden className="h-[20px] w-[20px] shrink-0 text-[var(--ui-800)]" />
      ) : (
        <>
          <Icon
            aria-hidden
            className="h-[20px] w-[20px] shrink-0 text-[var(--ui-500)] group-hover:hidden"
          />
          <HoverIcon
            aria-hidden
            className="hidden h-[20px] w-[20px] shrink-0 text-[var(--ui-700)] group-hover:block"
          />
        </>
      )}
    </button>
  );
}

const projectFieldMap: Record<string, string> = {
  웹: 'WEB',
  '모바일/앱': 'MOBILE',
  게임: 'GAME',
  블록체인: 'BLOCKCHAIN',
  기타: 'ETC',
};
const modeMap: Record<string, string> = {
  온라인: 'ONLINE',
  오프라인: 'OFFLINE',
  '온/오프라인': 'HYBRID',
};
const positionMap: Record<string, string> = {
  프론트엔드: 'FRONTEND',
  백엔드: 'BACKEND',
  인프라: 'INFRA',
};
const durationMonthsMap: Record<string, number> = {
  '1개월 이하': 1,
  '1-3개월': 2,
  '3-6개월': 4,
  '6개월 이상': 6,
};
const durationRangeMap: Record<string, string> = {
  '1개월 이하': 'UNDER_ONE',
  '1-3개월': 'ONE_TO_THREE',
  '3-6개월': 'THREE_TO_SIX',
  '6개월 이상': 'SIX_PLUS',
};
const domainToCategory: Record<string, string> = {
  헬스케어: 'HEALTHCARE',
  핀테크: 'FINTECH',
  이커머스: 'ECOMMERCE',
  교육: 'EDUCATION',
  '소셜/커뮤니티': 'SOCIAL',
  엔터테인먼트: 'ENTERTAINMENT',
  'AI/데이터': 'AI_DATA',
  기타: 'ETC',
};
const reverseProjectFieldMap: Record<string, string> = Object.fromEntries(
  Object.entries(projectFieldMap).map(([k, v]) => [v, k]),
);
const reverseModeMap: Record<string, string> = Object.fromEntries(
  Object.entries(modeMap).map(([k, v]) => [v, k]),
);
const reverseDurationRangeMap: Record<string, string> = Object.fromEntries(
  Object.entries(durationRangeMap).map(([k, v]) => [v, k]),
);
const reverseDomainToCategory: Record<string, string> = Object.fromEntries(
  Object.entries(domainToCategory).map(([k, v]) => [v, k]),
);
const reversePositionMap: Record<string, string> = Object.fromEntries(
  Object.entries(positionMap).map(([k, v]) => [v, k]),
);

const normalizeTechKey = (k: string) =>
  k
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^0-9a-zA-Z]/g, '')
    .toUpperCase();

/** API에서 오는 값(JAVASCRIPT 등) → UI 옵션 키(Javascript 등)로 변환. 수정 모드 복원 시 사용 */
const BACKEND_NAME_TO_UI_KEY: Record<string, string> = (() => {
  const positionKeys: PositionKey[] = ['frontend', 'backend', 'infra'];
  const acc: Record<string, string> = {};
  positionKeys.forEach((pos) => {
    getKeysByPosition(pos).forEach((uiKey) => {
      acc[normalizeTechKey(uiKey)] = uiKey;
    });
  });
  acc['REACT_NATIVE'] = 'ReactNative';
  return acc;
})();

const UI_KEY_TO_BACKEND_TECHSTACK: Record<string, string> = {
  ...TECHSTACK_KEY_TO_NAME,
  SPRINGBOOT: 'SPRINGBOOT',
  SPRINGW: 'SPRINGBOOT',
  SPRINGBOOTW: 'SPRINGBOOT',
  SPRING: 'SPRINGBOOT',
  REACTNATIVE: 'REACT_NATIVE',
  MONGODB: 'MONGODB',
  MYSQL: 'MYSQL',
};

function toTechStacksEnum(keys: string[]): string[] {
  return keys
    .map((k) => {
      const normalized = normalizeTechKey(k);
      return UI_KEY_TO_BACKEND_TECHSTACK[normalized] ?? normalized;
    })
    .filter(Boolean);
}

type ProjectFormFieldKey =
  | 'projectType'
  | 'domain'
  | 'progressType'
  | 'progressPeriod'
  | 'location'
  | 'deadline'
  | 'recruitments'
  | 'title'
  | 'content';

const PROJECT_FORM_FIELD_ORDER: ProjectFormFieldKey[] = [
  'projectType',
  'domain',
  'progressType',
  'progressPeriod',
  'location',
  'deadline',
  'recruitments',
  'title',
  'content',
];

const ProjectCreatePage = () => {
  const isDev = Boolean((import.meta as any).env?.DEV);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const locState = location.state as { projectId?: number; mode?: string } | null;
  const isEditMode = locState?.mode === 'edit' && locState?.projectId != null;
  const editProjectId = locState?.projectId ?? null;
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
  } = useProjectCreateStore();

  const [techStackOpen, setTechStackOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProjectFormFieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fieldRefs = useRef<Partial<Record<ProjectFormFieldKey, HTMLElement | null>>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);
  const submitAreaRef = useRef<HTMLDivElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageUploadingSlot, setImageUploadingSlot] = useState<number | null>(null);
  const [editorImageUploading, setEditorImageUploading] = useState(false);
  const editorImageInputRef = useRef<HTMLInputElement | null>(null);
  const [, setEditorSelectionKey] = useState(0);
  useEffect(() => {
    if (isEditMode) clearDraft();
  }, [isEditMode]);

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
        const { imageId, presignedUrl, imageUrl } = await getPresignedUrl(
          { imageType: 'PROJECT', fileName: file.name },
          token,
        );
        const putRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: file.type ? { 'Content-Type': file.type } : undefined,
        });
        if (!putRes.ok) {
          throw new Error(`이미지 업로드 실패 (${putRes.status})`);
        }
        await confirmImage(imageId, token);
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

  const canSaveRecruitment = Boolean(recruitPosition && recruitCount && techStack.length > 0);

  const onSaveRecruitment = () => {
    if (!recruitPosition || !recruitCount || techStack.length === 0) return;

    const nextItem: RecruitmentItem = {
      id: makeId(),
      positionLabel: recruitPosition,
      countLabel: recruitCount,
      techStackKeys: [...techStack],
    };

    setRecruitments((prev) => {
      const same = prev.some(
        (r) =>
          r.positionLabel === nextItem.positionLabel &&
          r.countLabel === nextItem.countLabel &&
          r.techStackKeys.join('|') === nextItem.techStackKeys.join('|'),
      );
      return same ? prev : [...prev, nextItem];
    });

    setFieldErrors((prev) => {
      if (!prev.recruitments) return prev;
      const next = { ...prev };
      delete next.recruitments;
      return next;
    });

    setTechStackOpen(false);
    setRecruitPosition(null);
    setRecruitCount(null);
    setTechStack([]);
  };

  const onRemoveRecruitment = (id: string) => {
    setRecruitments((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    if (!positionKey) {
      if (techStack.length) setTechStack([]);
      return;
    }
    const allowed = new Set(getKeysByPosition(positionKey));
    const next = techStack.filter((k) => allowed.has(k));
    if (next.length !== techStack.length) setTechStack(next);
  }, [positionKey, techStack]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: true,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Image.configure({
        inline: false,
      }),
      LinkCardExtension,
    ],
    content: projectContent || '',
    onUpdate: ({ editor }) => {
      setProjectContent(editor.getHTML());
      if (editor.getText().trim().length > 0) {
        setFieldErrors((prev) => {
          if (!prev.content) return prev;
          const next = { ...prev };
          delete next.content;
          return next;
        });
      }
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[380px] w-full bg-transparent outline-none ' +
          'Caption1 font-medium tracking-[0.0912px] text-ui-900 ' +
          '[&_ul]:list-disc [&_ul]:pl-[20px] [&_ul]:mt-[8px] [&_ul]:mb-[8px] ' +
          '[&_ol]:list-decimal [&_ol]:pl-[20px] [&_ol]:mt-[8px] [&_ol]:mb-[8px] ' +
          '[&_li]:my-[4px] ' +
          '[&_h1]:text-[20px] [&_h1]:font-bold [&_h1]:leading-snug [&_h1]:my-[10px] ' +
          '[&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:my-[10px] ' +
          '[&_a]:text-badge-text-primary [&_a]:underline [&_a]:underline-offset-2',
      },
    },
  });

  useEffect(() => {
    if (!isEditMode && editor && projectContent && editor.isEmpty) {
      editor.commands.setContent(projectContent, { emitUpdate: false });
    }
  }, [editor, projectContent, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !editProjectId || editDataLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const project = await getProjectDetail(editProjectId, token);
        if (cancelled || !project) return;

        setProjectTitle(project.title ?? '');
        setProjectContent(project.content ?? '');
        setLocationText(project.location ?? '');
        setDeadlineText(project.recruitmentDeadline ?? '');

        if (project.projectField) {
          setProjectType(
            reverseProjectFieldMap[project.projectField] ?? project.projectFieldName ?? null,
          );
        }
        if (project.category) {
          setDomain(reverseDomainToCategory[project.category] ?? project.categoryName ?? null);
        }
        if (project.mode) {
          setProgressType(reverseModeMap[project.mode] ?? project.modeName ?? null);
        }
        if (project.durationRange) {
          setProgressPeriod(
            reverseDurationRangeMap[project.durationRange] ?? project.durationRangeName ?? null,
          );
        }

        const rawRecruitments = project.recruitments ?? project.positions ?? [];
        if (rawRecruitments.length > 0) {
          const restored: RecruitmentItem[] = rawRecruitments.map((r) => {
            const posLabel = reversePositionMap[r.position] ?? r.positionName ?? String(r.position);
            const techKeys = Array.isArray(r.techStacks)
              ? r.techStacks
                  .map((ts) => {
                    const name = (ts.techStackName ?? (ts as any).techStack ?? '').trim();
                    if (!name) return '';
                    const normalized = normalizeTechKey(name);
                    return BACKEND_NAME_TO_UI_KEY[normalized] ?? normalized;
                  })
                  .filter(Boolean)
              : [];
            return {
              id: makeId(),
              positionLabel: posLabel,
              countLabel: `${r.count ?? 1}명`,
              techStackKeys: techKeys,
            };
          });
          setRecruitments(restored);
        }

        const imgUrls =
          project.imageUrls ??
          project.images?.map((i) => i.imageUrl ?? i.url).filter(Boolean) ??
          [];
        if (imgUrls.length > 0) {
          const slots: [SlotImage, SlotImage, SlotImage] = [null, null, null];
          imgUrls.slice(0, 3).forEach((url, i) => {
            if (url) slots[i] = { imageId: 0, imageUrl: url };
          });
          setSlotImages(slots);
        }

        if (editor && project.content) {
          editor.commands.setContent(project.content, { emitUpdate: false });
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

  useEffect(() => {
    if (!editor) return;
    const onSelectionUpdate = () => setEditorSelectionKey((k) => k + 1);
    editor.on('selectionUpdate', onSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
    };
  }, [editor]);

  const insertImageFromFile = async (file: File) => {
    const token = await getToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    setEditorImageUploading(true);
    try {
      const { imageId, presignedUrl, imageUrl } = await getPresignedUrl(
        { imageType: 'PROJECT', fileName: file.name },
        token,
      );
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: file.type ? { 'Content-Type': file.type } : undefined,
      });
      if (!putRes.ok) {
        throw new Error(`이미지 업로드 실패 (${putRes.status})`);
      }
      await confirmImage(imageId, token);
      editor?.chain().focus().setImage({ src: imageUrl }).run();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
      console.error('[project-create] editor image upload failed', msg, err);
      alert(msg);
    } finally {
      setEditorImageUploading(false);
    }
  };

  const onToolbarPickImage = () => {
    editorImageInputRef.current?.click();
  };

  const onToolbarLink = () => {
    if (!editor) return;
    const linkCardType = editor.schema.nodes.linkCard;
    if (!linkCardType) return;

    let cardPos: number | null = null;
    let cardSize = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.type === linkCardType) {
        cardPos = pos;
        cardSize = node.nodeSize;
        return false;
      }
      return true;
    });

    if (cardPos !== null) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: cardPos, to: cardPos + cardSize })
        .run();
      return;
    }

    editor.chain().focus().insertContent({ type: 'linkCard' }).run();
  };

  const handleSubmit = async () => {
    if (isDev) console.log('[project-create] handleSubmit called');
    setSubmitError(null);

    const nextErrors: Partial<Record<ProjectFormFieldKey, string>> = {};
    if (!projectType) nextErrors.projectType = '프로젝트 유형을 선택해주세요.';
    if (!domain) nextErrors.domain = '도메인을 선택해주세요.';
    if (!progressType) nextErrors.progressType = '진행 방식을 선택해주세요.';
    if (!progressPeriod) nextErrors.progressPeriod = '진행 기간을 선택해주세요.';
    if (!locationText.trim()) nextErrors.location = '진행 장소를 입력해주세요.';
    if (!deadlineText.trim()) nextErrors.deadline = '모집 마감일을 선택해주세요.';
    if (recruitments.length === 0)
      nextErrors.recruitments = '모집 분야를 1개 이상 등록해주세요.';
    if (!projectTitle.trim()) nextErrors.title = '프로젝트 제목을 입력해주세요.';
    const contentEmpty =
      !editor ||
      editor.isEmpty ||
      editor.getText().replace(/\u00a0/g, ' ').trim().length === 0;
    if (contentEmpty) nextErrors.content = '프로젝트 내용을 입력해주세요.';

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
      const raw = deadlineText.trim();
      let recruitmentDeadline = '2026-12-31';
      if (raw) {
        const normalized = raw.replace(/\./g, '-');
        const d = new Date(normalized);
        if (!Number.isNaN(d.getTime())) recruitmentDeadline = d.toISOString().slice(0, 10);
      }
      const recruitmentsPayload = recruitments.map((r) => {
        const position = positionMap[r.positionLabel] ?? 'BACKEND';
        const techStacksSent =
          r.techStackKeys.length > 0
            ? toTechStacksEnum(r.techStackKeys)
            : position === 'INFRA'
              ? []
              : ['BACKEND'];
        return {
          position,
          count: parseInt(r.countLabel, 10) || 1,
          techStacks: techStacksSent,
        };
      });
      const body = {
        projectField: projectFieldMap[projectType ?? ''] ?? 'WEB',
        category: domainToCategory[domain ?? ''] ?? 'ETC',
        mode: modeMap[progressType ?? ''] ?? 'ONLINE',
        durationMonths: durationMonthsMap[progressPeriod ?? ''] ?? 1,
        durationRange: durationRangeMap[progressPeriod ?? ''] ?? 'ONE_TO_THREE',
        location: locationText.trim() || '미정',
        recruitmentDeadline,
        recruitments: recruitmentsPayload,
        title: projectTitle.trim(),
        content: projectContent || '',
        imageIds: slotImages
          .map((s) => s?.imageId)
          .filter((id): id is number => id != null && id > 0)
          .slice(0, 3),
      };
      if (isDev) {
        console.log('createProject body(final)', body);
        console.groupCollapsed('[project-create] techStacks — 백엔드 enum과 비교용');
        recruitments.forEach((r, i) => {
          const sent = recruitmentsPayload[i].techStacks;
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
      try {
        const cacheKey = 'devine_my_projects_cache_v1';
        const raw = localStorage.getItem(cacheKey);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        const prev = Array.isArray(parsed) ? parsed : [];
        const rest = prev.filter((p: any) => Number(p?.id) !== result.projectId);
        const next = [{ id: result.projectId, name: body.title.trim() }, ...rest].filter(
          (p: any) => Number.isFinite(Number(p?.id)) && String(p?.name ?? '').trim().length > 0,
        );
        localStorage.setItem(cacheKey, JSON.stringify(next));
      } catch {}

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
    <div className="-mx-6 -my-8">
      <section className="bg-[var(--ui-bg)]">
        <div className="mx-auto w-full max-w-[1018px] px-6 py-[36px]">
          <h1 className="Title3 font-bold text-[var(--ui-900)]">
            {isEditMode ? (
              <>
                <span className="block">프로젝트 정보를 수정하고</span>
                <span className="block">업데이트해 보세요</span>
              </>
            ) : (
              <>
                <span className="block">프로젝트를 등록하고</span>
                <span className="block">함께 성장할 개발자들을 만나보세요</span>
              </>
            )}
          </h1>
        </div>
      </section>

      <section className="-translate-x-1/2 relative left-1/2 w-screen bg-[var(--ui-50)] py-[64px]">
        <div className="mx-auto w-full max-w-[1018px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-6 py-[40px]">
          <div className="mx-auto w-full max-w-[922px]">
            <div className="flex flex-col gap-[64px]">
              <section className="flex flex-col gap-[40px]">
                <h2 className="Heading2 font-semibold text-[var(--ui-900)]">
                  1. 프로젝트 정보를 입력해주세요
                </h2>

                <div className="flex flex-col gap-[40px]">
                  <div className="grid w-full grid-cols-2 gap-x-[240px] gap-y-[32px] max-[1100px]:grid-cols-1 max-[1100px]:gap-x-0">
                    <div
                      ref={fieldRefCallbacks.projectType}
                      className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full"
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
                      className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full"
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
                      className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full"
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
                      className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full"
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
                      className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full"
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
                      className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full"
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
                            onChange={setRecruitPosition}
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
                            value={recruitCount}
                            onChange={setRecruitCount}
                            options={[
                              { label: '1명', value: '1명' },
                              { label: '2명', value: '2명' },
                              { label: '3명', value: '3명' },
                              { label: '4명', value: '4명' },
                              { label: '5명', value: '5명' },
                              { label: '6명', value: '6명' },
                              { label: '7명', value: '7명' },
                              { label: '8명', value: '8명' },
                            ]}
                          />
                        </div>

                        <div className="flex w-[358px] flex-col gap-[8px] max-[1100px]:w-full">
                          <SubLabel>기술 스택</SubLabel>
                          <div className="relative">
                            <button
                              type="button"
                              disabled={!positionKey}
                              onClick={() => setTechStackOpen((v) => !v)}
                              className={`relative flex h-[44px] w-full items-center rounded-[12px] border bg-ui-bg px-[12px] text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                techStackOpen ? 'border-[#4E49FF]' : 'border-ui-200'
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

                            {positionKey ? (
                              <PositionBasedTechStackDropdown
                                open={techStackOpen}
                                position={positionKey}
                                value={techStack}
                                onChange={setTechStack}
                                onClose={() => setTechStackOpen(false)}
                              />
                            ) : null}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!canSaveRecruitment}
                          onClick={onSaveRecruitment}
                          className={`flex h-[44px] w-[80px] items-center justify-center rounded-[12px] px-[12px] py-[10px] max-[1100px]:w-full ${
                            canSaveRecruitment ? 'cursor-pointer bg-[#4E49FF]' : 'bg-[var(--ui-50)]'
                          }`}
                        >
                          <span
                            className={`Body1 font-base ${
                              canSaveRecruitment ? 'text-white' : 'text-[var(--ui-400)]'
                            }`}
                          >
                            저장
                          </span>
                        </button>
                      </div>

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

              <section className="flex flex-col gap-[40px]">
                <h2 className="Heading2 font-semibold text-[var(--ui-900)]">
                  2. 프로젝트 내용을 입력해주세요
                </h2>

                <div className="flex flex-col gap-[40px]">
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
                    <Label>프로젝트 내용</Label>

                    <div
                      ref={fieldRefCallbacks.content}
                      className={cn(
                        'w-full overflow-hidden rounded-[12px] bg-[var(--ui-50)]',
                        fieldErrors.content && 'ring-2 ring-form-error ring-offset-0',
                      )}
                    >
                      <div className="flex h-[48px] items-center border-[var(--ui-300)] border-b px-[14px]">
                        <div className="flex items-center gap-[22px]">
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton
                              Icon={TablerIconH1}
                              HoverIcon={TablerIconH1Hover}
                              label="H1"
                              active={!!editor?.isActive('heading', { level: 1 })}
                              onClick={() =>
                                editor?.chain().focus().toggleHeading({ level: 1 }).run()
                              }
                            />
                            <ToolbarButton
                              Icon={TablerIconH2}
                              HoverIcon={TablerIconH2Hover}
                              label="H2"
                              active={!!editor?.isActive('heading', { level: 2 })}
                              onClick={() =>
                                editor?.chain().focus().toggleHeading({ level: 2 }).run()
                              }
                            />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton
                              Icon={TablerIconBold}
                              HoverIcon={TablerIconBoldHover}
                              label="굵게"
                              active={!!editor?.isActive('bold')}
                              onClick={() => editor?.chain().focus().toggleBold().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconItalic}
                              HoverIcon={TablerIconItalicHover}
                              label="기울임"
                              active={!!editor?.isActive('italic')}
                              onClick={() => editor?.chain().focus().toggleItalic().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconStrikethrough}
                              HoverIcon={TablerIconStrikethroughHover}
                              label="취소선"
                              active={!!editor?.isActive('strike')}
                              onClick={() => editor?.chain().focus().toggleStrike().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconUnderline}
                              HoverIcon={TablerIconUnderlineHover}
                              label="밑줄"
                              active={!!editor?.isActive('underline')}
                              onClick={() => editor?.chain().focus().toggleUnderline().run()}
                            />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton
                              Icon={TablerIconListNumbers}
                              HoverIcon={TablerIconListNumbersHover}
                              label="번호 목록"
                              active={!!editor?.isActive('orderedList')}
                              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconList}
                              HoverIcon={TablerIconListHover}
                              label="불릿 목록"
                              active={!!editor?.isActive('bulletList')}
                              onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton
                              Icon={TablerIconPhoto}
                              HoverIcon={TablerIconPhotoHover}
                              label="이미지"
                              onClick={onToolbarPickImage}
                              disabled={editorImageUploading}
                            />
                            <ToolbarButton
                              Icon={TablerIconLink}
                              HoverIcon={TablerIconLinkHover}
                              label="링크"
                              active={!!editor?.isActive('link')}
                              onClick={onToolbarLink}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="relative min-h-[420px] px-[16px] pt-[16px]">
                        <input
                          ref={editorImageInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            e.target.value = '';
                            await insertImageFromFile(file);
                          }}
                        />

                        {editor ? (
                          <>
                            {editor.isEmpty ? (
                              <p className="Caption1 pointer-events-none absolute top-[16px] left-[16px] font-medium text-ui-300 tracking-[0.0912px]">
                                프로젝트 내용을 입력해주세요.
                              </p>
                            ) : null}
                            <EditorContent editor={editor} />
                          </>
                        ) : null}
                      </div>
                    </div>
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
                      className="Body1 h-[48px] w-[270px] cursor-pointer rounded-[12px] bg-[#4E49FF] font-medium text-white transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-60"
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
};

export default ProjectCreatePage;
