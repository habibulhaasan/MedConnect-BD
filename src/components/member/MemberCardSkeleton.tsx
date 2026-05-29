import { Skeleton } from '@/components/ui/skeleton'

export function MemberCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-4 space-y-3">
      {/* Top row */}
      <div className="flex gap-3">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      {/* Bottom row */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-10 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}