import { Skeleton } from '@/components/ui/skeleton'

export default function RegisterLoading() {
  return (
    <div className="space-y-6">
      {/* Stepper skeleton */}
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-full" />
            {i < 4 && <Skeleton className="w-8 h-0.5" />}
          </div>
        ))}
      </div>

      {/* Form card skeleton */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8 space-y-5">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  )
}