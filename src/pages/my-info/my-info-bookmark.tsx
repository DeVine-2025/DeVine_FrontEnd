import BackIcon from "@assets/icons/back.svg?react";
import { PROFILE_CARD_LIST } from '../../mocks/developer.mock';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import SearchTabs from '@components/tab/SearchTabs';
import {useNavigate} from 'react-router-dom';


const MyInfoBookmark = () => {

  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-[1180px] flex-col gap-[2rem] justify-between">
      <div className="flex-col gap-[2.4rem]">
        <BackIcon className="cursor-pointer text-ui-700 w-12 h-12" onClick={() => navigate(-1)} />
        <p className="text-ui-900 text-4xl font-bold">저장한 프로젝트/개발자</p>
      </div>
      <SearchTabs />
      <div className="flex-col gap-[2rem]">
        {PROFILE_CARD_LIST.map((dev) => (
          <RecommendDeveloperCard
            key={dev.id}
            role={dev.role}
            roleTone={dev.roleTone}
            nickname={dev.nickname}
            introduction={dev.introduction}
            domains={dev.badges?.slice(0, 3).map((b) => ({ label: b.label }))}
            techStack={dev.techStack}
            bookmarked={dev.bookmarked}
            onBookmarkChange={(next) => console.log('bookmark', dev.id, next)}
            onClick={() => console.log('click developer', dev.id)}
          />
        ))}
      </div>

    </div>
  );
};

export default MyInfoBookmark;