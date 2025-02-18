import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../shadcn/avatar';

type SessionProps = {
  displayName: string | null;
  pictureUrl?: string | null;
};

type TextProps = {
  text: string;
};

type ProfileAvatarProps = (SessionProps | TextProps) & {
  className?: string;
};

export function ProfileAvatar(props: ProfileAvatarProps) {
  const avatarClassName = cn(
    props.className,
    'mx-auto w-9 h-9 group-focus:ring-2',
  );

  if ('text' in props) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback>
          <span className={'uppercase'}>{props.text.slice(0, 1)}</span>
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = props.displayName?.slice(0, 1);

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={props.pictureUrl ?? undefined} />

      <AvatarFallback className={'animate-in fade-in'}>
        <span suppressHydrationWarning className={'uppercase'}>
          {initials}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}
