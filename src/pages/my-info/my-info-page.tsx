import ProfileDetail from '../../shared/templates/profileDetail';
import { cn } from '@libs/cn';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

type MenuItem = {
  path: string;
  name: string;
};

const MENU: MenuItem[] = [
  { path: '', name: '내 프로필' },
  { path: 'setting', name: '설정' },
  { path: 'bookmark', name: '저장한 프로젝트/개발자' },
];

const MyInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <div className="flex">
      <div className="mx-auto w-full max-w-[1180px] flex justify-between">
        <Outlet/>
        <div>
          <ul className="min-w-[254px] flex flex-col gap-[3.2rem] font-semibold text-3xl">
            {MENU.map((item) => {
              const targetPath = `/my-info/${item.path}`;
              const isSelected =
                item.path === ''
                  ? currentPath === '/my-info'
                  : currentPath.startsWith(targetPath);

              return (
                <li
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected ? 'text-ui-900' : 'text-ui-400'
                  )}
                >
                  {item.name}
                </li>
              );
            })}

            <li>
              <hr className="border-ui-400" />
            </li>

            <li className="cursor-pointer hover:text-ui-900 text-ui-400">
              로그아웃
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;

