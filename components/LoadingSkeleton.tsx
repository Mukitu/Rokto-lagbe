export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full skeleton shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-5 w-1/2 skeleton rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-16 skeleton rounded-full" />
                <div className="h-4 w-16 skeleton rounded-full" />
              </div>
              <div className="h-4 w-1/3 skeleton rounded" />
            </div>
          </div>
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-10 w-24 skeleton rounded-xl" />
            <div className="h-10 w-24 skeleton rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
