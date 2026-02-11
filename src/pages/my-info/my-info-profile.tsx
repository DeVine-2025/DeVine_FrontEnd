import ProfileDetail from '../../shared/templates/profileDetail';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import {useQuery} from '@tanstack/react-query';

const MyInfoProfile = () => {
  const {data} = useQuery(myInfoQueries.profile());
  return (
    <div>
      <ProfileDetail type={'내 정보'} profile={data?.result} />
    </div>
  );
};

export default MyInfoProfile;