import { useAuth } from '@clerk/clerk-react';
import { cn } from '@libs/cn';
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

  const { signOut } = useAuth();

  return (
    <div className="flex pt-3">
      <div className="mx-auto flex w-full max-w-[1180px] justify-between">
        <Outlet />

        <div>
          <ul className="flex min-w-[270px] flex-col gap-[3.2rem] font-semibold text-3xl">
            {MENU.map((item) => {
              const isSelected =
                item.path === 'bookmark'
                  ? currentPath.startsWith('/bookmark')
                  : item.path === ''
                    ? currentPath === '/my-info'
                    : currentPath.startsWith(`/my-info/${item.path}`);

              return (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.path === 'bookmark') {
                        navigate('/bookmark');
                      } else if (item.path === '') {
                        navigate('/my-info');
                      } else {
                        navigate(`/my-info/${item.path}`);
                      }
                    }}
                    className={cn(
                      'w-full cursor-pointer text-left transition-colors',
                      isSelected ? 'text-ui-900' : 'text-ui-400',
                    )}
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}

            <li>
              <hr className="border-ui-400" />
            </li>

            <li
              className="cursor-pointer text-ui-400 hover:text-ui-900"
              onClick={() => {
                signOut();
                navigate('/');
              }}
            >
              로그아웃
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;
