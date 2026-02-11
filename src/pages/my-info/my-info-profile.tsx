import ProfileDetail from '../../shared/templates/profileDetail';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import {useQuery} from '@tanstack/react-query';
import { useMemo } from 'react';

const MyInfoProfile = () => {
  const {data} = useQuery(myInfoQueries.profile());
  const {data:techStack} = useQuery(myInfoQueries.getMyTechStacks());

  // techStack 객체 배열에서 name 속성만 추출하여 문자열 배열로 변환
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