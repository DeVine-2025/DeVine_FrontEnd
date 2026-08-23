import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type FormEvent, useEffect, useState } from 'react';
import { cn } from '@libs/cn';
import {
  issueAdminCoupon,
  type IssueAdminCouponRequest,
} from '../apis/coupon';
import { getAdminMembers, type AdminMemberListItem } from '../apis/member';

type CouponIssueModalProps = {
  couponId: number;
  couponName: string;
  onClose: () => void;
};

type IssueType = IssueAdminCouponRequest['issueType'];
type CodeMode = 'AUTO' | 'CUSTOM';

const ISSUE_TYPES: Array<{ value: IssueType; label: string }> = [
  { value: 'ALL', label: '전체 회원 발급' },
  { value: 'SPECIFIC', label: '특정 회원 발급' },
  { value: 'CODE_GEN', label: '쿠폰 코드 생성' },
];

const INPUT_CLASS =
  'Body1 h-[48px] w-full rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[14px] text-[var(--ui-1000)] outline-none placeholder:text-[var(--ui-400)] focus:border-[#4e49ff]';

export function CouponIssueModal({ couponId, couponName, onClose }: CouponIssueModalProps) {
  const queryClient = useQueryClient();
  const [issueType, setIssueType] = useState<IssueType>('ALL');
  const [memberSearch, setMemberSearch] = useState('');
  const [debouncedMemberKeyword, setDebouncedMemberKeyword] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<AdminMemberListItem[]>([]);
  const [codeMode, setCodeMode] = useState<CodeMode>('AUTO');
  const [codeLength, setCodeLength] = useState('8');
  const [codeCount, setCodeCount] = useState('100');
  const [code, setCode] = useState('');
  const [maxUses, setMaxUses] = useState('100');
  const [formError, setFormError] = useState('');
  const [pendingRequest, setPendingRequest] = useState<IssueAdminCouponRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const memberSearchQuery = useQuery({
    queryKey: ['admin', 'members', 'coupon-issue-search', debouncedMemberKeyword],
    queryFn: () =>
      getAdminMembers({
        keyword: debouncedMemberKeyword,
        page: 1,
        size: 10,
      }),
    enabled: issueType === 'SPECIFIC' && Boolean(debouncedMemberKeyword),
  });

  const issueMutation = useMutation({
    mutationFn: (body: IssueAdminCouponRequest) => issueAdminCoupon(couponId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setFormError(message ?? '쿠폰을 발급하지 못했습니다.');
      setPendingRequest(null);
    },
  });

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !issueMutation.isPending) onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [issueMutation.isPending, onClose]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedMemberKeyword(memberSearch.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [memberSearch]);

  const buildRequest = (): IssueAdminCouponRequest | null => {
    if (issueType === 'ALL') return { issueType: 'ALL' };

    if (issueType === 'SPECIFIC') {
      if (selectedMembers.length === 0) {
        setFormError('발급할 회원을 선택해주세요.');
        return null;
      }

      return {
        issueType: 'SPECIFIC',
        nicknames: selectedMembers.map((member) => member.nickname),
      };
    }

    if (codeMode === 'AUTO') {
      const parsedCodeLength = Number(codeLength);
      const parsedCodeCount = Number(codeCount);

      if (!Number.isInteger(parsedCodeLength) || parsedCodeLength <= 0) {
        setFormError('코드 길이를 올바르게 입력해주세요.');
        return null;
      }
      if (!Number.isInteger(parsedCodeCount) || parsedCodeCount <= 0) {
        setFormError('생성할 코드 개수를 올바르게 입력해주세요.');
        return null;
      }

      return {
        issueType: 'CODE_GEN',
        codeLength: parsedCodeLength,
        codeCount: parsedCodeCount,
      };
    }

    const parsedMaxUses = Number(maxUses);
    if (!code.trim()) {
      setFormError('사용할 쿠폰 코드를 입력해주세요.');
      return null;
    }
    if (!Number.isInteger(parsedMaxUses) || parsedMaxUses <= 0) {
      setFormError('최대 사용 횟수를 올바르게 입력해주세요.');
      return null;
    }

    return {
      issueType: 'CODE_GEN',
      code: code.trim(),
      maxUses: parsedMaxUses,
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setCopied(false);

    const request = buildRequest();
    if (request) setPendingRequest(request);
  };

  const result = issueMutation.data;
  const generatedCodes = result?.generatedCodes ?? [];

  return (
    <div
      aria-label="쿠폰 발급"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-[20px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !issueMutation.isPending) onClose();
      }}
      role="dialog"
    >
      <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-[16px] bg-[var(--ui-bg)] p-[28px] shadow-xl">
        <div className="flex items-start justify-between gap-[20px]">
          <div>
            <h2 className="Title3 font-bold text-[var(--ui-1000)]">쿠폰 발급</h2>
            <p className="Body1 mt-[4px] text-[var(--ui-600)]">{couponName}</p>
          </div>
          <button
            aria-label="닫기"
            className="Body1 cursor-pointer rounded-[8px] px-[10px] py-[6px] text-[var(--ui-600)] hover:bg-[var(--ui-100)]"
            disabled={issueMutation.isPending}
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        {result ? (
          <div className="mt-[28px]">
            <div className="rounded-[10px] bg-[var(--positive-bg)] p-[20px] text-center">
              <p className="Headline1 font-semibold text-[var(--positive-text)]">
                쿠폰 발급이 완료되었습니다.
              </p>
              <p className="Body1 mt-[6px] text-[var(--ui-700)]">
                발급 수량 {(result.issuedCount ?? 0).toLocaleString('ko-KR')}건
              </p>
            </div>

            {generatedCodes.length > 0 && (
              <div className="mt-[20px]">
                <div className="flex items-center justify-between gap-[12px]">
                  <h3 className="Headline1 font-semibold text-[var(--ui-1000)]">
                    생성된 코드 {generatedCodes.length}개
                  </h3>
                  <button
                    className="Body1 cursor-pointer rounded-[8px] border border-[#4e49ff] px-[12px] py-[7px] text-[#4e49ff]"
                    onClick={async () => {
                      await navigator.clipboard.writeText(generatedCodes.join('\n'));
                      setCopied(true);
                    }}
                    type="button"
                  >
                    {copied ? '복사 완료' : '전체 복사'}
                  </button>
                </div>
                <ul className="mt-[12px] max-h-[220px] overflow-y-auto rounded-[8px] border border-[var(--ui-200)]">
                  {generatedCodes.map((generatedCode) => (
                    <li
                      className="Body1 border-[var(--ui-200)] border-b px-[14px] py-[10px] last:border-b-0"
                      key={generatedCode}
                    >
                      {generatedCode}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="Heading2 mt-[24px] h-[52px] w-full cursor-pointer rounded-[10px] bg-[#4e49ff] font-medium text-white"
              onClick={onClose}
              type="button"
            >
              확인
            </button>
          </div>
        ) : pendingRequest ? (
          <div className="mt-[28px]">
            <div className="rounded-[10px] border border-[var(--negative-text)] bg-[var(--negative-bg)] p-[20px]">
              <h3 className="Headline1 font-semibold text-[var(--negative-text)]">발급 확인</h3>
              <p className="Body1 mt-[8px] text-[var(--ui-800)]">
                {pendingRequest.issueType === 'ALL'
                  ? '전체 회원에게 쿠폰을 발급합니다.'
                  : pendingRequest.issueType === 'SPECIFIC'
                    ? `${pendingRequest.nicknames?.length ?? 0}명의 회원에게 쿠폰을 발급합니다.`
                    : '쿠폰 코드를 생성합니다.'}
              </p>
              <p className="Body1 mt-[4px] text-[var(--ui-600)]">
                발급 후에는 되돌릴 수 없습니다. 계속하시겠습니까?
              </p>
            </div>

            {formError && (
              <p className="Body1 mt-[16px] text-center text-[var(--negative-text)]">{formError}</p>
            )}

            <div className="mt-[24px] flex gap-[10px]">
              <button
                className="Heading2 h-[52px] flex-1 cursor-pointer rounded-[10px] border border-[var(--ui-300)] text-[var(--ui-800)]"
                disabled={issueMutation.isPending}
                onClick={() => setPendingRequest(null)}
                type="button"
              >
                이전
              </button>
              <button
                className="Heading2 h-[52px] flex-1 cursor-pointer rounded-[10px] bg-[#4e49ff] text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={issueMutation.isPending}
                onClick={() => issueMutation.mutate(pendingRequest)}
                type="button"
              >
                {issueMutation.isPending ? '발급 중...' : '발급 확정'}
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-[28px]" onSubmit={handleSubmit}>
            <fieldset>
              <legend className="Headline1 font-semibold text-[var(--ui-1000)]">발급 방식</legend>
              <div className="mt-[12px] grid grid-cols-1 gap-[8px] sm:grid-cols-3">
                {ISSUE_TYPES.map((type) => (
                  <button
                    className={cn(
                      'Body1 h-[48px] cursor-pointer rounded-[8px] border font-medium',
                      issueType === type.value
                        ? 'border-[#4e49ff] bg-[#4e49ff] text-white'
                        : 'border-[var(--ui-200)] bg-[var(--ui-bg)] text-[var(--ui-800)]',
                    )}
                    key={type.value}
                    onClick={() => {
                      setIssueType(type.value);
                      setFormError('');
                    }}
                    type="button"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {issueType === 'ALL' && (
              <p className="Body1 mt-[20px] rounded-[8px] bg-[var(--negative-bg)] px-[16px] py-[14px] text-[var(--negative-text)]">
                현재 가입된 전체 회원에게 쿠폰이 발급됩니다.
              </p>
            )}

            {issueType === 'SPECIFIC' && (
              <div className="mt-[20px]">
                <label className="flex flex-col gap-[8px]" htmlFor="coupon-member-search">
                  <span className="Body1 font-semibold text-[var(--ui-1000)]">회원 검색</span>
                  <input
                    autoComplete="off"
                    className={INPUT_CLASS}
                    id="coupon-member-search"
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="이름, 닉네임 또는 이메일을 입력해주세요"
                    type="search"
                    value={memberSearch}
                  />
                </label>

                {debouncedMemberKeyword && (
                  <div className="mt-[8px] overflow-hidden rounded-[8px] border border-[var(--ui-200)]">
                    {memberSearchQuery.isPending ? (
                      <p className="Body1 px-[14px] py-[16px] text-center text-[var(--ui-500)]">
                        회원을 검색하는 중입니다.
                      </p>
                    ) : memberSearchQuery.isError ? (
                      <p className="Body1 px-[14px] py-[16px] text-center text-[var(--negative-text)]">
                        회원 검색에 실패했습니다.
                      </p>
                    ) : memberSearchQuery.data?.content.length ? (
                      <ul className="max-h-[220px] overflow-y-auto">
                        {memberSearchQuery.data.content.map((member) => {
                          const isSelected = selectedMembers.some(
                            (selected) => selected.nickname === member.nickname,
                          );
                          const memberMeta = [member.name?.trim(), member.email?.trim()]
                            .filter(Boolean)
                            .join(' · ');

                          return (
                            <li
                              className="border-[var(--ui-200)] border-b last:border-b-0"
                              key={member.nickname}
                            >
                              <button
                                className="flex w-full cursor-pointer items-center justify-between gap-[16px] px-[14px] py-[12px] text-left hover:bg-[var(--ui-50)] disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isSelected}
                                onClick={() => {
                                  setSelectedMembers((current) => [...current, member]);
                                  setMemberSearch('');
                                  setDebouncedMemberKeyword('');
                                }}
                                type="button"
                              >
                                <span className="min-w-0">
                                  <span className="Body1 block truncate font-semibold text-[var(--ui-1000)]">
                                    {member.nickname}
                                  </span>
                                  {memberMeta && (
                                    <span className="Caption1 block truncate text-[var(--ui-500)]">
                                      {memberMeta}
                                    </span>
                                  )}
                                </span>
                                <span className="Caption1 shrink-0 text-[#4e49ff]">
                                  {isSelected ? '선택됨' : '선택'}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="Body1 px-[14px] py-[16px] text-center text-[var(--ui-500)]">
                        검색 결과가 없습니다.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-[16px]">
                  <div className="flex items-center justify-between">
                    <span className="Body1 font-semibold text-[var(--ui-1000)]">선택된 회원</span>
                    <span className="Caption1 text-[var(--ui-500)]">
                      {selectedMembers.length}명
                    </span>
                  </div>
                  {selectedMembers.length > 0 ? (
                    <ul className="mt-[8px] flex flex-wrap gap-[8px]">
                      {selectedMembers.map((member) => (
                        <li
                          className="Body1 inline-flex items-center gap-[8px] rounded-full bg-[var(--ui-100)] px-[12px] py-[7px] text-[var(--ui-800)]"
                          key={member.nickname}
                        >
                          {member.nickname}
                          <button
                            aria-label={`${member.nickname} 선택 해제`}
                            className="cursor-pointer text-[var(--ui-500)] hover:text-[var(--negative-text)]"
                            onClick={() =>
                              setSelectedMembers((current) =>
                                current.filter((item) => item.nickname !== member.nickname),
                              )
                            }
                            type="button"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="Body1 mt-[8px] rounded-[8px] bg-[var(--ui-50)] px-[14px] py-[14px] text-center text-[var(--ui-500)]">
                      선택된 회원이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            )}

            {issueType === 'CODE_GEN' && (
              <div className="mt-[20px]">
                <div className="flex gap-[8px]">
                  {[
                    { value: 'AUTO' as const, label: '자동 생성' },
                    { value: 'CUSTOM' as const, label: '직접 코드 지정' },
                  ].map((mode) => (
                    <button
                      className={cn(
                        'Body1 h-[42px] flex-1 cursor-pointer rounded-[8px] border',
                        codeMode === mode.value
                          ? 'border-[#4e49ff] text-[#4e49ff]'
                          : 'border-[var(--ui-200)] text-[var(--ui-600)]',
                      )}
                      key={mode.value}
                      onClick={() => setCodeMode(mode.value)}
                      type="button"
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {codeMode === 'AUTO' ? (
                  <div className="mt-[16px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                    <label className="flex flex-col gap-[8px]">
                      <span className="Body1 font-semibold">코드 길이</span>
                      <input
                        className={INPUT_CLASS}
                        min="1"
                        onChange={(event) => setCodeLength(event.target.value)}
                        type="number"
                        value={codeLength}
                      />
                    </label>
                    <label className="flex flex-col gap-[8px]">
                      <span className="Body1 font-semibold">생성 개수</span>
                      <input
                        className={INPUT_CLASS}
                        min="1"
                        onChange={(event) => setCodeCount(event.target.value)}
                        type="number"
                        value={codeCount}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-[16px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                    <label className="flex flex-col gap-[8px]">
                      <span className="Body1 font-semibold">쿠폰 코드</span>
                      <input
                        className={INPUT_CLASS}
                        onChange={(event) => setCode(event.target.value)}
                        placeholder="SUMMER2026"
                        value={code}
                      />
                    </label>
                    <label className="flex flex-col gap-[8px]">
                      <span className="Body1 font-semibold">최대 사용 횟수</span>
                      <input
                        className={INPUT_CLASS}
                        min="1"
                        onChange={(event) => setMaxUses(event.target.value)}
                        type="number"
                        value={maxUses}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {formError && (
              <p className="Body1 mt-[16px] text-center text-[var(--negative-text)]">{formError}</p>
            )}

            <button
              className="Heading2 mt-[24px] h-[52px] w-full cursor-pointer rounded-[10px] bg-[#4e49ff] font-medium text-white"
              type="submit"
            >
              발급 내용 확인
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
