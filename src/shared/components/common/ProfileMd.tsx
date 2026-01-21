import { cn } from '@libs/cn';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeRow, HeaderBlock, Intro, TechChips } from './ProfileBase';

export default function ProfileCardMd(props: ProfileCardProps) {
  return (
    <article className={cn('rounded-2xl bg-filter-bg', 'card-size-md', props.className)}>
      <div className="flex flex-col">
        <HeaderBlock
          {...props}
          avatarClass="card-avatar-md"
          roleClass="text-base"
          titleClass="text-lg font-semibold"
        />

        <div className="mt-6">
          <BadgeRow badges={props.badges} pillClass="px-4 py-2 text-sm" />
        </div>

        <div className="mt-6">
          <Intro introduction={props.introduction} />
        </div>

        <div className="mt-6">
          <TechChips techStack={props.techStack} max={5} />
        </div>
      </div>
    </article>
  );
}
