import { LinkCardExtension } from '@pages/project-create/LinkCardNode';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { uploadProjectImage } from '@apis/images';
import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ProjectFormFieldKey } from './project-form-validation';

type Props = {
  projectContent: string;
  setProjectContent: (content: string) => void;
  setFieldErrors: Dispatch<SetStateAction<Partial<Record<ProjectFormFieldKey, string>>>>;
  isEditMode: boolean;
  getToken: () => Promise<string | null>;
};
export function useProjectContentEditor({
  projectContent,
  setProjectContent,
  setFieldErrors,
  isEditMode,
  getToken,
}: Props) {
  const [editorImageUploading, setEditorImageUploading] = useState(false);
  const editorImageInputRef = useRef<HTMLInputElement | null>(null);
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

  const insertImageFromFile = async (file: File) => {
    const token = await getToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    setEditorImageUploading(true);
    try {
      const { imageUrl } = await uploadProjectImage(file, token);
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

  return {
    editor,
    editorImageUploading,
    editorImageInputRef,
    onToolbarPickImage,
    onToolbarLink,
    insertImageFromFile,
  };
}
