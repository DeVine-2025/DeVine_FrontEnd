import type { ProfileCardProps } from '../../types/profileCard.types';
import ProfileCardLg from './ProfileLg';
import ProfileCardMd from './ProfileMd';
import ProfileCardSm from './ProfileSm';

export default function ProfileCard(props: ProfileCardProps) {
  const size = props.size ?? 'sm';

  if (size === 'lg') return <ProfileCardLg {...props} />;
  if (size === 'md') return <ProfileCardMd {...props} />;
  return <ProfileCardSm {...props} />;
}
