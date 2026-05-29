import { Skeleton } from '@/components/ui/skeleton'

export default function FavoritesLoading() {
  return (
    <div className="space-y-5 pb-4">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-100 p-4 space-y-3">
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-10 rounded-full" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((j) => <Skeleton key={j} className="w-8 h-8 rounded-full" />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}