import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { type FormEvent, useState } from 'react';
import Pagination from '@components/common/Pagination';
import { getAdminMembers, type AdminMemberListItem } from '../../apis/member';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type UserStatusTone = 'positive' | 'negative' | 'neutral';

type UserListRow = {
  nickname: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
  statusTone: UserStatusTone;
};

const PAGE_SIZE = 10;

const STATUS_META: Record<string, { label: string; tone: UserStatusTone }> = {
  ACTIVE: { label: '정상', tone: 'positive' },
  SUSPENDED: { label: '정지', tone: 'negative' },
  WITHDRAWN: { label: '탈퇴', tone: 'neutral' },
  PENDING_WITHDRAWAL: { label: '탈퇴 예정', tone: 'neutral' },
};

const toUserListRow = (member: AdminMemberListItem): UserListRow => {
  const statusMeta = STATUS_META[member.status] ?? {
    label: member.status,
    tone: 'neutral' as const,
  };

  return {
    nickname: member.nickname,
    name: member.name?.trim() || '-',
    email: member.email?.trim() || '-',
    joinedAt: dayjs(member.createdAt).format('YY-MM-DD'),
    status: statusMeta.label,
    statusTone: statusMeta.tone,
  };
};

const USER_COLUMNS: AdminTableColumn<UserListRow>[] = [
  {
    id: 'nickname',
    header: '닉네임',
    width: '18%',
    cell: (user) => user.nickname,
  },
  {
    id: 'name',
    header: '이름',
    width: '16%',
    cell: (user) => user.name,
  },
  {
    id: 'email',
    header: '이메일',
    width: '30%',
    cell: (user) => user.email,
  },
  {
    id: 'joinedAt',
    header: '가입일',
    width: '18%',
    cell: (user) => <time>{user.joinedAt}</time>,
  },
  {
    id: 'status',
    header: '상태',
    width: '18%',
    cell: (user) => <AdminStatusBadge status={user.status} tone={user.statusTone} />,
  },
];

export default function UserListPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const { data, isError, isPending } = useQuery({
    queryKey: ['admin', 'members', keyword, page, PAGE_SIZE],
    queryFn: () => getAdminMembers({ keyword: keyword || undefined, page, size: PAGE_SIZE }),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const users = data?.content.map(toUserListRow) ?? [];
  const totalPages = data?.totalPages ?? 1;
  const emptyMessage = isPending
    ? '유저 목록을 불러오는 중입니다.'
    : isError
      ? '유저 목록을 불러오지 못했습니다.'
      : keyword
        ? '검색 결과가 없습니다.'
        : '등록된 유저가 없습니다.';

  return (
    <AdminListLayout
      filters={
        <form className="flex w-full gap-[8px]" onSubmit={handleSearch} role="search">
          <label className="sr-only" htmlFor="admin-user-search">
            유저 검색
          </label>
          <input
            className="Body1 h-[48px] min-w-0 flex-1 rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[16px] font-medium text-[var(--ui-1000)] outline-none placeholder:text-[var(--ui-400)] focus:border-[#4e49ff]"
            id="admin-user-search"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="이름, 닉네임, 이메일 검색"
            type="search"
            value={searchInput}
          />
          <button
            className="Body1 h-[48px] shrink-0 cursor-pointer rounded-[8px] bg-[#4e49ff] px-[20px] font-medium text-white transition-colors hover:bg-[#3e39e8]"
            type="submit"
          >
            검색
          </button>
        </form>
      }
      footer={
        <Pagination page={page} totalPages={totalPages} onChange={setPage} maxButtons={5} />
      }
      title="유저 검색 / 목록"
    >
      <AdminTable
        ariaLabel="유저 목록"
        columns={USER_COLUMNS}
        data={users}
        emptyMessage={emptyMessage}
        getRowHref={(user) => `/admin/users/${encodeURIComponent(user.nickname)}`}
        getRowKey={(user) => user.nickname}
      />
    </AdminListLayout>
  );
}
