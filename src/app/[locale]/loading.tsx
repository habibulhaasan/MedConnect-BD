import { Skeleton } from '@/components/ui/skeleton'

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col w-60 bg-white border-r border-zinc-100 p-4 gap-3 flex-shrink-0">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-1 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <Skeleton className="h-14 w-full flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 space-y-5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}