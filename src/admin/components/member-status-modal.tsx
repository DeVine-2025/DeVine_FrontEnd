import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type FormEvent, useEffect, useState } from 'react';
import { cn } from '@libs/cn';
import {
  type AdminMemberStatusAction,
  type UpdateAdminMemberStatusRequest,
  updateAdminMemberStatus,
} from '../apis/member';

type MemberStatusModalProps = {
  action: AdminMemberStatusAction;
  nickname: string;
  onClose: () => void;
};

const ACTION_COPY: Record<
  AdminMemberStatusAction,
  {
    title: string;
    description: string;
    confirmLabel: string;
    needsReason: boolean;
    needsNotify: boolean;
    danger: boolean;
  }
> = {
  SUSPEND: {
    title: '계정 정지',
    description: '해당 유저의 계정 이용을 정지합니다.',
    confirmLabel: '정지',
    needsReason: true,
    needsNotify: true,
    danger: false,
  },
  UNSUSPEND: {
    title: '정지 해제',
    description: '해당 유저의 계정 정지를 해제합니다.',
    confirmLabel: '정지 해제',
    needsReason: false,
    needsNotify: false,
    danger: false,
  },
  FORCE_WITHDRAW: {
    title: '강제 탈퇴 신청',
    description: '강제 탈퇴는 즉시 삭제가 아닌 30일 소멸 절차 후 확정됩니다.',
    confirmLabel: '강제 탈퇴 신청',
    needsReason: true,
    needsNotify: false,
    danger: true,
  },
  CANCEL_WITHDRAWAL: {
    title: '강제 탈퇴 취소',
    description: '진행 중인 강제 탈퇴 절차를 취소합니다.',
    confirmLabel: '강제 탈퇴 취소',
    needsReason: false,
    needsNotify: false,
    danger: false,
  },
};

const INPUT_CLASS =
  'Body1 w-full rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[14px] py-[12px] text-[var(--ui-1000)] outline-none placeholder:text-[var(--ui-400)] focus:border-[#4e49ff]';

export function MemberStatusModal({ action, nickname, onClose }: MemberStatusModalProps) {
  const queryClient = useQueryClient();
  const copy = ACTION_COPY[action];
  const [reason, setReason] = useState('');
  const [notifyRequested, setNotifyRequested] = useState(false);
  const [formError, setFormError] = useState('');

  const mutation = useMutation({
    mutationFn: (body: UpdateAdminMemberStatusRequest) => updateAdminMemberStatus(nickname, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      onClose();
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setFormError(message ?? '계정 상태를 변경하지 못했습니다.');
    },
  });

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutation.isPending) onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [mutation.isPending, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (copy.needsReason && !reason.trim()) {
      setFormError('처리 사유를 입력해주세요.');
      return;
    }

    mutation.mutate({
      action,
      ...(copy.needsReason ? { reason: reason.trim() } : {}),
      ...(copy.needsNotify ? { notifyRequested } : {}),
    });
  };

  return (
    <div
      aria-label={copy.title}
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-[20px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !mutation.isPending) onClose();
      }}
      role="dialog"
    >
      <div className="w-full max-w-[480px] rounded-[16px] bg-[var(--ui-bg)] p-[28px] text-center shadow-xl">
        <h2 className="Title3 font-bold text-[var(--ui-1000)]">{copy.title}</h2>
        <p className="Body1 mt-[8px] text-[var(--ui-700)]">
          <strong>{nickname}</strong> 계정에 대해 {copy.description}
        </p>

        <form className="mt-[24px] text-left" onSubmit={handleSubmit}>
          {copy.needsReason && (
            <label className="flex flex-col gap-[8px]">
              <span className="Body1 font-semibold text-[var(--ui-1000)]">처리 사유</span>
              <textarea
                className={cn(INPUT_CLASS, 'h-[120px] resize-y')}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
                placeholder="처리 사유를 입력해주세요"
                value={reason}
              />
              <span className="Caption1 text-right text-[var(--ui-500)]">{reason.length}/500</span>
            </label>
          )}

          {copy.needsNotify && (
            <label className="mt-[16px] flex cursor-pointer items-center gap-[10px]">
              <input
                checked={notifyRequested}
                className="size-[18px] accent-[#4e49ff]"
                onChange={(event) => setNotifyRequested(event.target.checked)}
                type="checkbox"
              />
              <span className="Body1 text-[var(--ui-700)]">유저에게 정지 안내를 발송합니다</span>
            </label>
          )}

          {formError && (
            <p className="Body1 mt-[16px] text-center text-[var(--negative-text)]">{formError}</p>
          )}

          <div className="mt-[24px] flex gap-[10px]">
            <button
              className="Heading2 h-[48px] flex-1 cursor-pointer rounded-[10px] border border-[var(--ui-200)] text-[var(--ui-700)]"
              disabled={mutation.isPending}
              onClick={onClose}
              type="button"
            >
              닫기
            </button>
            <button
              className={cn(
                'Heading2 h-[48px] flex-1 cursor-pointer rounded-[10px] text-white disabled:cursor-not-allowed disabled:opacity-60',
                copy.danger ? 'bg-[var(--negative-text)]' : 'bg-[#4e49ff]',
              )}
              disabled={mutation.isPending}
              type="submit"
            >
              {mutation.isPending ? '처리 중...' : copy.confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
