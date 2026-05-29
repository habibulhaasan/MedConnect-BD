import { Skeleton } from '@/components/ui/skeleton'

export default function PendingLoading() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Progress card */}
      <div className="rounded-xl border border-zinc-100 p-5 space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="space-y-1 pt-1 flex-1">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        ))}
      </div>

      {/* Payment details card */}
      <div className="rounded-xl border border-zinc-100 p-5 space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  )
}