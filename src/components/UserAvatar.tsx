interface UserAvatarProps {
  displayName: string | null;
  size?: string;
}

function getInitial(name: string | null): string {
  if (!name || name.trim().length === 0) return 'A';
  return name.trim().charAt(0).toUpperCase();
}

export default function UserAvatar({ displayName, size = 'size-10' }: UserAvatarProps) {
  return (
    <div
      className={`${size} rounded-full bg-red-500 text-white font-bold flex items-center justify-center shrink-0 text-sm`}
    >
      {getInitial(displayName)}
    </div>
  );
}
