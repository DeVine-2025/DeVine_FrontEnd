import { cn } from '@libs/cn';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeRow, HeaderBlock, Intro, TechChips } from './ProfileBase';

export default function ProfileCardLg(props: ProfileCardProps) {
  return (
    <article className={cn('rounded-2xl bg-filter-bg', 'card-size-lg', props.className)}>
      <div className="flex items-start gap-10">
        {/* Left */}
        <div className="flex-1">
          <HeaderBlock
            {...props}
            avatarClass="card-avatar-md"
            roleClass="text-base"
            titleClass="text-xl font-semibold"
          />

          <div className="mt-6">
            <BadgeRow badges={props.badges} pillClass="px-4 py-2 text-sm" />
          </div>

          <div className="mt-6">
            <Intro introduction={props.introduction} />
          </div>
        </div>

        {/* Right: 스택 오른쪽 정렬 */}
        <div className="w-[520px]">
          <TechChips techStack={props.techStack} max={5} />
        </div>
      </div>
    </article>
  );
}
