import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ChangeEvent, SVGProps } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import PlusIcon from '@assets/icons/create-project/plus.svg?react';
import UnderVectorIcon from '@assets/icons/create-project/under-vector.svg?react';
import TablerIconH1 from '@assets/icons/create-project/tabler-icon-h-1.svg?react';
import TablerIconH2 from '@assets/icons/create-project/tabler-icon-h-2.svg?react';
import TablerIconBold from '@assets/icons/create-project/tabler-icon-bold.svg?react';
import TablerIconItalic from '@assets/icons/create-project/tabler-icon-italic.svg?react';
import TablerIconStrikethrough from '@assets/icons/create-project/tabler-icon-strikethrough.svg?react';
import TablerIconUnderline from '@assets/icons/create-project/tabler-icon-underline.svg?react';
import TablerIconListNumbers from '@assets/icons/create-project/tabler-icon-list-numbers.svg?react';
import TablerIconList from '@assets/icons/create-project/tabler-icon-list.svg?react';
import TablerIconPhoto from '@assets/icons/create-project/tabler-icon-photo.svg?react';
import TablerIconLink from '@assets/icons/create-project/tabler-icon-link.svg?react';
import SelectDropdown from '@components/common/SelectDropdown';
import PositionBasedTechStackDropdown from '@components/common/PositionBasedTechStackDropdown';
import {
  TECH_STACK_LABEL_BY_KEY,
  type PositionKey,
  getKeysByPosition,
} from '@constants/position-tech-stack';

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

function Label({ children }: { children: string }) {
  return (
    <p className="Headline1 font-medium text-[var(--ui-700)]">
      {children}
    </p>
  );
}

function SubLabel({ children }: { children: string }) {
  return (
    <p className="Label1 font-medium text-[var(--ui-700)]">
      {children}
    </p>
  );
}

function DropdownLike({ placeholder }: { placeholder: string }) {
  return (
    <button
      type="button"
      className="relative flex h-[44px] w-full items-center rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[12px] text-left"
    >
      <span className="Caption1 text-[var(--ui-400)]">{placeholder}</span>
      <span className="absolute right-[10px] top-1/2 -translate-y-1/2 inline-flex h-[28px] w-[28px] items-center justify-center text-[var(--ui-400)]">
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
      onChange={() => {
        // (호환용)
      }}
      className="h-[48px] w-full rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-50)] px-[12px] Caption1 font-medium tracking-[0.0912px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)] focus:outline-none focus:ring-2 focus:ring-[rgba(78,73,255,0.25)]"
    />
  );
}

function InputField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className="h-[48px] w-full rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-50)] px-[12px] Caption1 font-medium tracking-[0.0912px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)] focus:outline-none focus:ring-2 focus:ring-[rgba(78,73,255,0.25)]"
    />
  );
}

// 프로젝트 내용 에디터

function ImageSlot({
  label,
  inputId,
  previewUrl,
  onChange,
}: {
  label: string;
  inputId: string;
  previewUrl: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      htmlFor={inputId}
      className="relative block h-[166px] w-[296px] cursor-pointer overflow-hidden rounded-[12px] bg-ui-50"
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onChange}
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt={label}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <>
          <p className="Body1 absolute left-1/2 top-[31px] w-[150px] -translate-x-1/2 text-center font-medium text-ui-400">
            {label}
          </p>
          <div className="absolute left-1/2 top-[75px] h-[60px] w-[60px] -translate-x-1/2 overflow-hidden rounded-full flex-row-center">
            <PlusIcon aria-hidden className="h-full w-full" />
          </div>
        </>
      )}
    </label>
  );
}

function ToolbarButton({
  Icon,
  label,
  onClick,
  active,
}: {
  Icon: SvgIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[20px] w-[20px] items-center justify-center transition-colors ${
        active ? 'text-ui-700' : 'text-ui-400 hover:text-ui-700'
      }`}
      aria-label={label}
    >
      <Icon aria-hidden className="h-[20px] w-[20px]" />
    </button>
  );
}

const ProjectCreatePage = () => {
  const [locationText, setLocationText] = useState('');
  const [deadlineText, setDeadlineText] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectContent, setProjectContent] = useState('');
  const [projectType, setProjectType] = useState<string | null>(null);
  const [domain, setDomain] = useState<string | null>(null);
  const [progressType, setProgressType] = useState<string | null>(null);
  const [progressPeriod, setProgressPeriod] = useState<string | null>(null);
  const [recruitPosition, setRecruitPosition] = useState<string | null>(null);
  const [recruitCount, setRecruitCount] = useState<string | null>(null);
  const [techStackOpen, setTechStackOpen] = useState(false);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<string | null>>([null, null, null]);
  const editorImageInputRef = useRef<HTMLInputElement | null>(null);

  const onPickImage = useMemo(() => {
    return (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : null;
        setImagePreviews((prev) => {
          const next = [...prev];
          next[index] = url;
          return next;
        });
      };
      reader.readAsDataURL(file);
      // 재선택 허용
      e.target.value = '';
    };
  }, []);

  const positionKey = useMemo<PositionKey | null>(() => {
    if (recruitPosition === '프론트엔드') return 'frontend';
    if (recruitPosition === '백엔드') return 'backend';
    if (recruitPosition === '인프라') return 'infra';
    return null;
  }, [recruitPosition]);

  // 포지션 변경 시 스택 정리
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
      }),
      Image.configure({
        inline: false,
      }),
    ],
    content: projectContent || '',
    onUpdate: ({ editor }) => {
      setProjectContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          // 에디터 스타일
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

  const insertImageFromFile = (file: File) => {
    const url = URL.createObjectURL(file);
    editor?.chain().focus().setImage({ src: url }).run();
  };

  const onToolbarPickImage = () => {
    editorImageInputRef.current?.click();
  };

  const onToolbarLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link')?.href as string | undefined;
    const url = window.prompt('링크 URL을 입력해주세요', prev ?? '');
    if (url === null) return;
    const next = url.trim();
    if (!next) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: next }).run();
  };

  return (
    <div className="-mx-6 -my-8">
      {/* 상단 */}
      <section className="bg-[var(--ui-bg)]">
        <div className="mx-auto w-full max-w-[1018px] px-6 py-[36px]">
          <h1 className="Title3 font-bold text-[var(--ui-900)]">
            <span className="block">프로젝트를 등록하고</span>
            <span className="block">함께 성장할 개발자들을 만나보세요</span>
          </h1>
        </div>
      </section>

      {/* 본문 */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[var(--ui-50)] py-[64px]">
        <div className="mx-auto w-full max-w-[1018px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-6 py-[40px]">
          <div className="mx-auto w-full max-w-[922px]">
            <div className="flex flex-col gap-[64px]">
              {/* 프로젝트 정보 */}
              <section className="flex flex-col gap-[40px]">
                <h2 className="Heading2 font-semibold text-[var(--ui-900)]">
                  1. 프로젝트 정보를 입력해주세요
                </h2>

                <div className="flex flex-col gap-[40px]">
                  <div className="grid w-full grid-cols-2 gap-x-[240px] gap-y-[32px] max-[1100px]:grid-cols-1 max-[1100px]:gap-x-0">
                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>프로젝트 유형</Label>
                      <SelectDropdown
                        placeholder="프로젝트 유형"
                        value={projectType}
                        onChange={setProjectType}
                        options={[
                          { label: '웹', value: '웹' },
                          { label: '모바일/앱', value: '모바일/앱' },
                          { label: '게임', value: '게임' },
                          { label: '블록체인', value: '블록체인' },
                          { label: '기타', value: '기타' },
                        ]}
                      />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>도메인</Label>
                      <SelectDropdown
                        placeholder="도메인"
                        value={domain}
                        onChange={setDomain}
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
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>진행 방식</Label>
                      <SelectDropdown
                        placeholder="진행 방식"
                        value={progressType}
                        onChange={setProgressType}
                        options={[
                          { label: '온/오프라인', value: '온/오프라인' },
                          { label: '온라인', value: '온라인' },
                          { label: '오프라인', value: '오프라인' },
                        ]}
                      />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>진행 기간</Label>
                      <SelectDropdown
                        placeholder="진행 기간"
                        value={progressPeriod}
                        onChange={setProgressPeriod}
                        options={[
                          { label: '1개월 이하', value: '1개월 이하' },
                          { label: '1-3개월', value: '1-3개월' },
                          { label: '3-6개월', value: '3-6개월' },
                          { label: '6개월 이상', value: '6개월 이상' },
                        ]}
                      />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>진행 장소</Label>
                      <InputField placeholder="서울시 중구" value={locationText} onChange={setLocationText} />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>모집 마감일</Label>
                      <InputField placeholder="YYYY.MM.DD" value={deadlineText} onChange={setDeadlineText} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[20px]">
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
                              className="relative flex h-[44px] w-full items-center rounded-[12px] border border-ui-200 bg-ui-bg px-[12px] text-left disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {techStack.length ? (
                                <span className="Caption1 w-[calc(100%-36px)] truncate font-medium text-ui-900">
                                  {techStack
                                    .map((k) => TECH_STACK_LABEL_BY_KEY[k] ?? k)
                                    .join(', ')}
                                </span>
                              ) : (
                                <span className="Caption1 text-ui-400">
                                  {positionKey ? '기술 스택' : '포지션을 먼저 선택해주세요'}
                                </span>
                              )}
                              <span className="absolute right-[10px] top-1/2 -translate-y-1/2 inline-flex h-[28px] w-[28px] items-center justify-center text-ui-400">
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
                          className="flex h-[44px] w-[80px] items-center justify-center rounded-[12px] bg-[var(--ui-50)] px-[12px] py-[10px] max-[1100px]:w-full"
                        >
                          <span className="Body1 font-medium text-[var(--ui-400)]">
                            저장
                          </span>
                        </button>
                      </div>

                      <div className="h-[158px] w-full rounded-[16px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[16px]">
                        <p className="Caption1 tracking-[0.0912px] text-[var(--ui-300)]">
                          아직 등록된 모집 분야가 없습니다. 위에서 정보를 입력해 주세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 프로젝트 내용 */}
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
                        previewUrl={imagePreviews[0]}
                        onChange={onPickImage(0)}
                      />
                      <ImageSlot
                        label="사진 추가하기"
                        inputId="project-image-1"
                        previewUrl={imagePreviews[1]}
                        onChange={onPickImage(1)}
                      />
                      <ImageSlot
                        label="사진 추가하기"
                        inputId="project-image-2"
                        previewUrl={imagePreviews[2]}
                        onChange={onPickImage(2)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <Label>프로젝트 제목</Label>
                    <InputField
                      placeholder="프로젝트 제목을 입력해주세요."
                      value={projectTitle}
                      onChange={setProjectTitle}
                    />
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <Label>프로젝트 내용</Label>

                    <div className="w-full overflow-hidden rounded-[12px] bg-[var(--ui-50)]">
                      <div className="flex h-[48px] items-center border-b border-[var(--ui-300)] px-[14px]">
                        <div className="flex items-center gap-[22px]">
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton
                              Icon={TablerIconH1}
                              label="H1"
                              active={!!editor?.isActive('heading', { level: 1 })}
                              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconH2}
                              label="H2"
                              active={!!editor?.isActive('heading', { level: 2 })}
                              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                            />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton
                              Icon={TablerIconBold}
                              label="굵게"
                              active={!!editor?.isActive('bold')}
                              onClick={() => editor?.chain().focus().toggleBold().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconItalic}
                              label="기울임"
                              active={!!editor?.isActive('italic')}
                              onClick={() => editor?.chain().focus().toggleItalic().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconStrikethrough}
                              label="취소선"
                              active={!!editor?.isActive('strike')}
                              onClick={() => editor?.chain().focus().toggleStrike().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconUnderline}
                              label="밑줄"
                              active={!!editor?.isActive('underline')}
                              onClick={() => editor?.chain().focus().toggleUnderline().run()}
                            />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton
                              Icon={TablerIconListNumbers}
                              label="번호 목록"
                              active={!!editor?.isActive('orderedList')}
                              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            />
                            <ToolbarButton
                              Icon={TablerIconList}
                              label="불릿 목록"
                              active={!!editor?.isActive('bulletList')}
                              onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton Icon={TablerIconPhoto} label="이미지" onClick={onToolbarPickImage} />
                            <ToolbarButton
                              Icon={TablerIconLink}
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
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            insertImageFromFile(file);
                            e.target.value = '';
                          }}
                        />

                        {editor ? (
                          <>
                            {editor.isEmpty ? (
                              <p className="Caption1 pointer-events-none absolute left-[16px] top-[16px] font-medium tracking-[0.0912px] text-ui-300">
                                프로젝트 내용을 입력해주세요.
                              </p>
                            ) : null}
                            <EditorContent editor={editor} />
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full justify-center pt-[8px]">
                    <button
                      type="button"
                      className="Body1 group relative h-[52px] w-[292px] overflow-hidden rounded-[12px] bg-[#4E49FF] font-medium text-white transition-transform duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0px_10px_24px_rgba(78,73,255,0.25)] active:translate-y-0 active:shadow-none"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 90%)',
                        }}
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -left-[40%] top-0 h-full w-[40%] -skew-x-12 bg-white/20 opacity-0 transition-[transform,opacity] duration-300 ease-out group-hover:translate-x-[380%] group-hover:opacity-100"
                      />
                      <span className="relative z-10">등록하기</span>
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

