import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

function LinkCardView({ editor, node, getPos, deleteNode }: ReactNodeViewProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const apply = () => {
    const pos = typeof getPos === 'function' ? getPos() : null;
    if (pos === undefined || pos === null) return;
    const next = url.trim();
    if (!next) {
      deleteNode();
      return;
    }
    const href = /^https?:\/\//i.test(next) ? next : `https://${next}`;
    const hrefEscaped = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const textEscaped = href.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const linkHTML = `<a href="${hrefEscaped}" target="_blank" rel="noopener noreferrer">${textEscaped}</a>`;
    const size = node.nodeSize;
    editor.chain().focus().deleteRange({ from: pos, to: pos + size }).insertContentAt(pos, linkHTML).run();
  };

  return (
    <NodeViewWrapper as="div" className="my-3 inline-block w-full">
      <div className="rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-50)] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="Label1 font-semibold text-[var(--ui-800)]">링크 등록</p>
          <button
            type="button"
            onClick={() => deleteNode()}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--ui-500)] transition-colors hover:bg-[var(--ui-200)] hover:text-[var(--ui-700)]"
            aria-label="취소"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
              if (e.key === 'Escape') deleteNode();
            }}
            placeholder="URL을 입력하세요"
            className="Caption1 flex-1 border-0 border-b border-[var(--ui-300)] bg-transparent pb-2 font-medium text-[var(--ui-900)] outline-none placeholder:text-[var(--ui-400)] focus:border-[#4E49FF]"
          />
          <button
            type="button"
            onClick={apply}
            className="Label1 shrink-0 rounded-[8px] bg-[var(--ui-300)] px-4 py-2 font-medium text-[var(--ui-800)] transition-colors hover:bg-[var(--ui-400)]"
          >
            확인
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const LinkCardExtension = Node.create({
  name: 'linkCard',
  group: 'block',
  atom: true,
  addNodeView() {
    return ReactNodeViewRenderer(LinkCardView);
  },
});
