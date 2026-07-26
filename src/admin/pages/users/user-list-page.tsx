import { useState } from 'react';
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

  return (
    <AdminListLayout
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
