import { type FormEvent, useState } from 'react';
import Pagination from '@components/common/Pagination';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type UserStatus = '정상' | '정지';

type User = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: UserStatus;
  lastLoginAt: string;
};

const USER_DATA: User[] = [
  {
    id: 'U-0231',
    name: '김개발',
    email: 'Kim@kimgal.com',
    joinedAt: '25-11-02',
    status: '정지',
    lastLoginAt: '07-08',
  },
  {
    id: 'U-0230',
    name: '김개발',
    email: 'Kim@kimgal.com',
    joinedAt: '25-11-02',
    status: '정상',
    lastLoginAt: '07-08',
  },
  {
    id: 'U-0229',
    name: '김개발',
    email: 'Kim@kimgal.com',
    joinedAt: '25-11-02',
    status: '정지',
    lastLoginAt: '07-08',
  },
];

const USER_COLUMNS: AdminTableColumn<User>[] = [
  {
    id: 'id',
    header: '유저 ID',
    width: '12%',
    cell: (user) => user.id,
  },
  {
    id: 'name',
    header: '이름',
    width: '12%',
    cell: (user) => user.name,
  },
  {
    id: 'email',
    header: '이메일',
    width: '24%',
    cell: (user) => user.email,
  },
  {
    id: 'joinedAt',
    header: '가입일',
    width: '14%',
    cell: (user) => <time dateTime={`20${user.joinedAt}`}>{user.joinedAt}</time>,
  },
  {
    id: 'status',
    header: '상태',
    width: '14%',
    cell: (user) =>
      user.status === '정지' ? (
        <AdminStatusBadge status={user.status} tone="negative" />
      ) : (
        user.status
      ),
  },
  {
    id: 'lastLoginAt',
    header: '최근 로그인',
    width: '14%',
    cell: (user) => user.lastLoginAt,
  },
];

export default function UserListPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
  };

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
      footer={<Pagination page={page} totalPages={68} onChange={setPage} maxButtons={5} />}
      title="유저 검색 / 목록"
    >
      <AdminTable
        ariaLabel="유저 목록"
        columns={USER_COLUMNS}
        data={USER_DATA}
        getRowHref={(user) => `/admin/users/${user.id}`}
        getRowKey={(user) => user.id}
      />
    </AdminListLayout>
  );
}
