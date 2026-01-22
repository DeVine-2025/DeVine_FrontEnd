import { cn } from '@libs/cn';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, HeaderBlock, Intro, TechChips } from './ProfileBase';

export default function ProfileCardSm(props: ProfileCardProps) {
  return (
    <article className={cn('rounded-2xl bg-filter-bg', 'card-size-sm')}>
      <HeaderBlock
        {...props}
        avatarClass="card-avatar-sm"
        roleClass="text-base"
        titleClass="text-[16px] font-medium"
      />

      <div>
        <BadgeList badges={props.badges} className="mt-6 gap-3" />
      </div>

      <div className="mt-2">
        <Intro introduction={props.introduction} />
      </div>

      <div className="mt-2">
        <TechChips techStack={props.techStack} max={4} />
      </div>
    </article>
  );
}
