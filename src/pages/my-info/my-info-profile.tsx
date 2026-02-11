import ProfileDetail from '../../shared/templates/profileDetail';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import {useQuery} from '@tanstack/react-query';
import { useMemo } from 'react';

const MyInfoProfile = () => {
  const {data} = useQuery(myInfoQueries.profile());
  const {data:techStack} = useQuery(myInfoQueries.getMyTechStacks());

  const techStackNames = useMemo(() => {
    if (!techStack?.result?.techstacks) return [];
    return techStack.result.techstacks.map((item: { name: string }) => item.name);
  }, [techStack]);

  return (
    <div>
      <ProfileDetail type={'내 정보'} profile={data?.result} techStack={techStackNames} />
    </div>
  );
};

export default MyInfoProfile;