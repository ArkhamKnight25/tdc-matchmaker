import type { MatchTier } from '../../types';
import clsx from 'clsx';

const STYLES: Record<MatchTier, string> = {
  'High Potential': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Worth Exploring': 'bg-amber-100 text-amber-800 border-amber-200',
  'Long Shot': 'bg-rose-100 text-rose-800 border-rose-200',
};

export function TierBadge({ tier, score }: { tier: MatchTier; score: number }) {
  return (
    <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold', STYLES[tier])}>
      <span className="text-lg font-bold">{score}</span>
      <span>{tier}</span>
    </div>
  );
}
