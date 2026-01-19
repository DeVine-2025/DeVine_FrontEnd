import { Link, useLocation } from 'react-router-dom';
import { cn } from '@libs/cn';

const ProjectDeveloperFilter = () => {
  const location = useLocation();
  const isProject = location.pathname === '/recommend/project';
  const isDeveloper = location.pathname === '/recommend/developer';

  return (
    <div className="flex gap-1 bg-[var(--ui-100)] rounded-[16px] p-2 w-[340px] h-[64px]">
      <Link
        to="/recommend/project"
        className={cn(
          'flex items-center justify-center px-5 py-2 rounded-xl transition-all',
          isProject
            ? 'bg-[var(--ui-bg)] shadow-[0px_2px_8px_-4px_rgba(0,0,0,0.2)]'
            : '',
        )}
      >
        <p
          className={cn(
            'Title3 text-center font-bold',
            isProject ? 'text-[var(--ui-900)]' : 'text-[var(--ui-600)]',
          )}
          style={isProject ? { letterSpacing: '-0.552px' } : undefined}
        >
          프로젝트
        </p>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
        }}
        className={cn(
          'flex items-center justify-center px-5 py-2 rounded-xl transition-all',
          isDeveloper
            ? 'bg-[var(--ui-bg)] shadow-[0px_2px_8px_-4px_rgba(0,0,0,0.2)]'
            : '',
        )}
      >
        <p
          className={cn(
            'Title3 text-center',
            isDeveloper ? 'text-[var(--ui-900)]' : 'text-[var(--ui-600)]',
          )}
        >
          개발자
        </p>
      </button>
    </div>
  );
};

export default ProjectDeveloperFilter;
