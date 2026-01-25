import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import { PROFILE_CARD_LIST } from 'src/mocks/developer.mock';

const RecommendDeveloperPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      {PROFILE_CARD_LIST.map((dev) => (
        <RecommendDeveloperCard
          key={dev.id}
          role={dev.role}
          roleTone={dev.roleTone}
          nickname={dev.nickname}
          profileImageUrl={dev.profileImageUrl}
          introduction={dev.introduction}
          domains={dev.badges?.slice(0, 3).map((b) => ({ label: b.label }))}
          techStack={dev.techStack}
          bookmarked={dev.bookmarked}
          onBookmarkChange={(next) => console.log('bookmark', dev.id, next)}
          onClick={() => console.log('click developer', dev.id)}
        />
      ))}
    </div>
  );
};

export default RecommendDeveloperPage;

