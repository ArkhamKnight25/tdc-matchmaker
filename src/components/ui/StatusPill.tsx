import type { JourneyStage } from '../../types';
import clsx from 'clsx';

const STAGE_STYLES: Record<JourneyStage, string> = {
  'New': 'bg-blue-100 text-blue-700',
  'Profile Verified': 'bg-indigo-100 text-indigo-700',
  'Matching': 'bg-amber-100 text-amber-700',
  'Intro Sent': 'bg-purple-100 text-purple-700',
  'On Hold': 'bg-gray-100 text-gray-600',
  'Matched': 'bg-emerald-100 text-emerald-700',
};

export function StatusPill({ stage }: { stage: JourneyStage }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', STAGE_STYLES[stage])}>
      {stage}
    </span>
  );
}
