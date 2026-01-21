import { cn } from '@libs/cn';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeRow, HeaderBlock, Intro, TechChips } from './ProfileBase';

export default function ProfileCardSm(props: ProfileCardProps) {
  return (
    <article
      className={cn('flex flex-col rounded-2xl bg-filter-bg', 'card-size-sm', props.className)}
    >
      <HeaderBlock
        {...props}
        avatarClass="card-avatar-sm"
        roleClass="text-base"
        titleClass="text-[16px] font-medium"
      />

      <div className="mt-6">
        <BadgeRow badges={props.badges} pillClass="px-4 py-2 text-[10px]" />
      </div>

      <div className="mt-6">
        <Intro introduction={props.introduction} />
      </div>

      <div className="mt-6">
        <TechChips techStack={props.techStack} max={4} />
      </div>
    </article>
  );
}
