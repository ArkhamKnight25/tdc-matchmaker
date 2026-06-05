import { CheckCircle } from 'lucide-react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function getColor(name: string) {
  const colors = ['bg-rose-200 text-rose-800', 'bg-purple-200 text-purple-800', 'bg-indigo-200 text-indigo-800', 'bg-teal-200 text-teal-800', 'bg-amber-200 text-amber-800', 'bg-pink-200 text-pink-800'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, size = 'md', verified }: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <div className={`${SIZE_CLASSES[size]} ${getColor(name)} rounded-full flex items-center justify-center font-semibold`}>
        {getInitials(name)}
      </div>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5">
          <CheckCircle className="w-4 h-4 text-emerald-500 fill-white" />
        </span>
      )}
    </div>
  );
}
