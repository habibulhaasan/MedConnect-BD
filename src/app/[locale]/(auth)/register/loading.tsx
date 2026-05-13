import { Skeleton } from '@/components/ui/skeleton'

export default function RegisterLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}