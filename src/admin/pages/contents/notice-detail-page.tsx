import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAdminNotice } from '../../apis/notice';
import { AdminPageTitle } from '../../components/common/admin-page-title';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';

const STATUS_META: Record<string, { label: string; tone: 'positive' | 'neutral' }> = {
  HIDDEN: { label: '비노출', tone: 'neutral' },
  SCHEDULED: { label: '게시 예정', tone: 'neutral' },
  EXPOSED: { label: '노출', tone: 'positive' },
  VISIBLE: { label: '노출', tone: 'positive' },
  ENDED: { label: '게시 종료', tone: 'neutral' },
  EXPIRED: { label: '게시 종료', tone: 'neutral' },
};

const formatDateTime = (value: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-h-[56px] items-center border-[var(--ui-200)] border-b px-[18px] last:border-b-0">
      <span className="Body1 w-[120px] shrink-0 font-semibold text-[var(--ui-700)]">{label}</span>
      <div className="Body1 min-w-0 flex-1 break-words text-[var(--ui-1000)]">{value}</div>
    </div>
  );
}

export default function NoticeDetailPage() {
  const { noticeId } = useParams();
  const parsedNoticeId = Number(noticeId);
  const isValidNoticeId = Number.isInteger(parsedNoticeId) && parsedNoticeId > 0;
  const { data, error, isPending } = useQuery({
    queryKey: ['admin', 'notices', 'detail', parsedNoticeId],
    queryFn: () => getAdminNotice(parsedNoticeId),
    enabled: isValidNoticeId,
  });

  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <section>
      <Link
        className="Body1 inline-flex cursor-pointer items-center gap-[6px] font-medium text-[1.5rem] text-[var(--ui-700)] no-underline hover:text-[var(--ui-1000)]"
        to="/admin/contents?type=notice"
      >
        <ArrowLeftAdminIcon
          aria-hidden="true"
          className="[&_path]:!fill-current h-[18px] w-[18px] shrink-0"
        />
        공지사항 목록으로
      </Link>

      <AdminPageTitle className="mt-[8px]" title="공지사항 상세" />

      {!isValidNoticeId || error ? (
        <div className="Body1 mt-[28px] rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[24px] py-[64px] text-center text-[var(--ui-500)]">
          {!isValidNoticeId || isNotFound
            ? '공지사항을 찾을 수 없습니다.'
            : '공지사항 상세 정보를 불러오지 못했습니다.'}
        </div>
      ) : isPending || !data ? (
        <div className="Body1 mt-[28px] rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[24px] py-[64px] text-center text-[var(--ui-500)]">
          공지사항 상세 정보를 불러오는 중입니다.
        </div>
      ) : (
        <div className="mt-[28px] flex flex-col gap-[24px]">
          <div className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]">
            <div className="flex flex-wrap items-start justify-between gap-[16px]">
              <div>
                <p className="Body1 text-[var(--ui-500)]">공지 ID {data.noticeId}</p>
                <h2 className="Title3 mt-[6px] font-bold text-[var(--ui-1000)]">{data.title}</h2>
              </div>
              <AdminStatusBadge
                status={STATUS_META[data.displayStatus]?.label ?? data.displayStatus}
                tone={
                  STATUS_META[data.displayStatus]?.tone ??
                  (data.isExposed ? 'positive' : 'neutral')
                }
              />
            </div>

            <div className="Body1 mt-[24px] min-h-[200px] whitespace-pre-wrap rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-50)] p-[20px] leading-[1.7] text-[var(--ui-1000)]">
              {data.content}
            </div>
          </div>

          <div className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]">
            <h2 className="Headline1 font-semibold text-[var(--ui-1000)]">게시 정보</h2>
            <div className="mt-[16px] overflow-hidden rounded-[8px] border border-[var(--ui-200)]">
              <InfoItem label="노출 설정" value={data.isExposed ? '노출' : '비노출'} />
              <InfoItem label="게시 시작" value={formatDateTime(data.displayStartAt)} />
              <InfoItem label="게시 종료" value={formatDateTime(data.displayEndAt)} />
              <InfoItem label="등록일" value={formatDateTime(data.createdAt)} />
              <InfoItem label="수정일" value={formatDateTime(data.updatedAt)} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
