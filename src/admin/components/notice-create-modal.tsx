import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type FormEvent, useEffect, useState } from 'react';
import { cn } from '@libs/cn';
import {
  createAdminNotice,
  type CreateAdminNoticeRequest,
} from '../apis/notice';

type NoticeCreateModalProps = {
  onClose: () => void;
};

const INPUT_CLASS =
  'Body1 w-full rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[14px] text-[var(--ui-1000)] outline-none placeholder:text-[var(--ui-400)] focus:border-[#4e49ff]';

const withSeconds = (value: string) => (value.length === 16 ? `${value}:00` : value);

export function NoticeCreateModal({ onClose }: NoticeCreateModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasDisplayPeriod, setHasDisplayPeriod] = useState(false);
  const [displayStartAt, setDisplayStartAt] = useState('');
  const [displayEndAt, setDisplayEndAt] = useState('');
  const [isExposed, setIsExposed] = useState(true);
  const [formError, setFormError] = useState('');

  const createMutation = useMutation({
    mutationFn: (body: CreateAdminNoticeRequest) => createAdminNotice(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });
      onClose();
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setFormError(message ?? '공지사항을 등록하지 못했습니다.');
    },
  });

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !createMutation.isPending) onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [createMutation.isPending, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setFormError('내용을 입력해주세요.');
      return;
    }
    if (hasDisplayPeriod && (!displayStartAt || !displayEndAt)) {
      setFormError('게시 시작일과 종료일을 모두 입력해주세요.');
      return;
    }
    if (hasDisplayPeriod && displayStartAt > displayEndAt) {
      setFormError('게시 종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    const body: CreateAdminNoticeRequest = {
      title: title.trim(),
      content: content.trim(),
      isExposed,
      ...(hasDisplayPeriod
        ? {
            displayStartAt: withSeconds(displayStartAt),
            displayEndAt: withSeconds(displayEndAt),
          }
        : {}),
    };

    createMutation.mutate(body);
  };

  return (
    <div
      aria-label="공지사항 신규 등록"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-[20px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !createMutation.isPending) onClose();
      }}
      role="dialog"
    >
      <div className="max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-[16px] bg-[var(--ui-bg)] p-[28px] shadow-xl">
        <div className="flex items-start justify-between gap-[20px]">
          <div>
            <h2 className="Title3 font-bold text-[var(--ui-1000)]">공지사항 등록</h2>
            <p className="Body1 mt-[4px] text-[var(--ui-600)]">
              유저 화면에 표시할 공지사항을 작성해주세요.
            </p>
          </div>
          <button
            className="Body1 cursor-pointer rounded-[8px] px-[10px] py-[6px] text-[var(--ui-600)] hover:bg-[var(--ui-100)]"
            disabled={createMutation.isPending}
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <form className="mt-[28px]" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-[8px]">
            <span className="Body1 font-semibold text-[var(--ui-1000)]">제목</span>
            <input
              className={cn(INPUT_CLASS, 'h-[48px]')}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="공지사항 제목을 입력해주세요"
              value={title}
            />
          </label>

          <label className="mt-[20px] flex flex-col gap-[8px]">
            <span className="Body1 font-semibold text-[var(--ui-1000)]">내용</span>
            <textarea
              className={cn(INPUT_CLASS, 'h-[180px] resize-y py-[12px]')}
              onChange={(event) => setContent(event.target.value)}
              placeholder="공지사항 내용을 입력해주세요"
              value={content}
            />
          </label>

          <fieldset className="mt-[20px]">
            <legend className="Body1 font-semibold text-[var(--ui-1000)]">노출 여부</legend>
            <div className="mt-[8px] grid grid-cols-2 gap-[8px]">
              {[
                { value: true, label: '노출' },
                { value: false, label: '비노출' },
              ].map((option) => (
                <button
                  aria-pressed={isExposed === option.value}
                  className={cn(
                    'Body1 h-[46px] cursor-pointer rounded-[8px] border font-medium',
                    isExposed === option.value
                      ? 'border-[#4e49ff] bg-[#4e49ff] text-white'
                      : 'border-[var(--ui-200)] text-[var(--ui-700)]',
                  )}
                  key={option.label}
                  onClick={() => setIsExposed(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-[20px]">
            <label className="flex cursor-pointer items-center gap-[10px]">
              <input
                checked={hasDisplayPeriod}
                className="size-[18px] accent-[#4e49ff]"
                onChange={(event) => setHasDisplayPeriod(event.target.checked)}
                type="checkbox"
              />
              <span className="Body1 font-semibold text-[var(--ui-1000)]">게시 기간 설정</span>
              <span className="Caption1 text-[var(--ui-500)]">미설정 시 상시 노출</span>
            </label>

            {hasDisplayPeriod && (
              <div className="mt-[12px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <label className="flex flex-col gap-[6px]">
                  <span className="Caption1 font-medium text-[var(--ui-600)]">게시 시작</span>
                  <input
                    className={cn(INPUT_CLASS, 'h-[48px]')}
                    onChange={(event) => setDisplayStartAt(event.target.value)}
                    type="datetime-local"
                    value={displayStartAt}
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="Caption1 font-medium text-[var(--ui-600)]">게시 종료</span>
                  <input
                    className={cn(INPUT_CLASS, 'h-[48px]')}
                    min={displayStartAt || undefined}
                    onChange={(event) => setDisplayEndAt(event.target.value)}
                    type="datetime-local"
                    value={displayEndAt}
                  />
                </label>
              </div>
            )}
          </div>

          {formError && (
            <p className="Body1 mt-[16px] text-center text-[var(--negative-text)]">{formError}</p>
          )}

          <div className="mt-[28px] flex gap-[10px]">
            <button
              className="Heading2 h-[52px] flex-1 cursor-pointer rounded-[10px] border border-[var(--ui-200)] text-[var(--ui-700)]"
              disabled={createMutation.isPending}
              onClick={onClose}
              type="button"
            >
              취소
            </button>
            <button
              className="Heading2 h-[52px] flex-1 cursor-pointer rounded-[10px] bg-[#4e49ff] text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createMutation.isPending}
              type="submit"
            >
              {createMutation.isPending ? '등록 중...' : '공지사항 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
