import { cn } from '@/lib/utils/cn'
import type { BloodGroup } from '@/types'

interface BloodGroupBadgeProps {
  bloodGroup: BloodGroup
  size?: 'sm' | 'md'
}

const BLOOD_GROUP_STYLES: Record<BloodGroup, string> = {
  'A+':  'bg-red-100 text-red-700 border-red-200',
  'A-':  'bg-red-50 text-red-600 border-red-100',
  'B+':  'bg-blue-100 text-blue-700 border-blue-200',
  'B-':  'bg-blue-50 text-blue-600 border-blue-100',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
  'AB-': 'bg-purple-50 text-purple-600 border-purple-100',
  'O+':  'bg-green-100 text-green-700 border-green-200',
  'O-':  'bg-green-50 text-green-600 border-green-100',
}

export function BloodGroupBadge({ bloodGroup, size = 'md' }: BloodGroupBadgeProps) {
  return (
    <span
      aria-label={`Blood group: ${bloodGroup}`}
      className={cn(
        'inline-flex items-center rounded-full font-bold border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        BLOOD_GROUP_STYLES[bloodGroup]
      )}
    >
      {bloodGroup}
    </span>
  )
}