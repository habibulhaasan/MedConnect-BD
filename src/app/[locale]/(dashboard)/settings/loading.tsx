import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-4">
      <Skeleton className="h-7 w-28" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-zinc-100 p-5 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-10 w-full" />
          {i === 2 && (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          )}
        </div>
      ))}
    </div>
  )
}