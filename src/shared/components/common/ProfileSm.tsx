import { cn } from '@libs/cn';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, HeaderBlock, Intro, TechChips } from './ProfileBase';

export default function ProfileCardSm(props: ProfileCardProps) {
  const { onClick } = props;
  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn('rounded-2xl bg-ui-50', 'card-size-sm', onClick && 'cursor-pointer')}
    >
      <HeaderBlock
        {...props}
        avatarClass="card-avatar-sm"
        roleClass="text-base"
        titleClass="text-[16px] font-medium"
      />

      <div>
        <BadgeList badges={props.badges} className="mt-6 gap-3" />
      </div>

      <div className="mt-1 ml-2">
        <Intro introduction={props.introduction} />
      </div>

      <div className="mt-1">
        <TechChips techStack={props.techStack} max={4} />
      </div>
    </article>
  );
}
