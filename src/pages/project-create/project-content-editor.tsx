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
import { EditorContent, type Editor } from '@tiptap/react';
import {
  useEffect,
  useState,
  type ComponentType,
  type SVGProps,
  type Ref,
  type RefObject,
} from 'react';
import { cn } from '@libs/cn';
type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;
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

type Props = {
  editor: Editor | null;
  fieldRef: Ref<HTMLDivElement>;
  error?: string;
  editorImageUploading: boolean;
  editorImageInputRef: RefObject<HTMLInputElement | null>;
  onToolbarPickImage: () => void;
  onToolbarLink: () => void;
  insertImageFromFile: (file: File) => Promise<void>;
};
export default function ProjectContentEditor({
  editor,
  fieldRef,
  error,
  editorImageUploading,
  editorImageInputRef,
  onToolbarPickImage,
  onToolbarLink,
  insertImageFromFile,
}: Props) {
  const [, setEditorSelectionKey] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const onSelectionUpdate = () => setEditorSelectionKey((k) => k + 1);
    editor.on('selectionUpdate', onSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
    };
  }, [editor]);

  return (
    <div
      ref={fieldRef}
      className={cn(
        'w-full overflow-hidden rounded-[12px] bg-[var(--ui-50)]',
        error && 'ring-2 ring-form-error ring-offset-0',
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
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            />
            <ToolbarButton
              Icon={TablerIconH2}
              HoverIcon={TablerIconH2Hover}
              label="H2"
              active={!!editor?.isActive('heading', { level: 2 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
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
      <div className="relative min-h-[420px] lg:max-2xl:min-h-[clamp(320px,48svh,400px)] px-[16px] pt-[16px]">
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
  );
}
