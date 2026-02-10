import ProfileDetail from '../../shared/templates/profileDetail';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import {useQuery} from '@tanstack/react-query';

const MyInfoProfile = () => {
  const {data} = useQuery(myInfoQueries.profile());
  console.log(data);
  return (
    <div>
      <ProfileDetail type={'내 정보'}/>
    </div>
  );
};

export default MyInfoProfile;