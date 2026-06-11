export default function AiDeckRecommendSkeleton() {
  return (
    <section className="bg-base-3 relative min-h-138.75 rounded-2xl p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="h-5 w-24 animate-pulse rounded bg-[#E5E5E5]" />
        <div className="h-4 w-20 animate-pulse rounded bg-[#E5E5E5]" />
      </div>

      <div className="mt-4 flex flex-col gap-3.75">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-3.75 rounded-xl bg-[#F9F9F9] px-3 py-3.75">
            <div className="flex gap-2.5">
              <div className="h-5 w-10.5 shrink-0 animate-pulse rounded-full bg-[#E5E5E5]" />
              <div className="flex flex-1 flex-col gap-1.25">
                <div className="h-4 w-32 animate-pulse rounded bg-[#E5E5E5]" />
                <div className="h-3.5 w-28 animate-pulse rounded bg-[#E5E5E5]" />
              </div>
            </div>

            <div className="flex h-8.25 items-center gap-1.25">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-8.25 w-8.5 animate-pulse rounded-sm bg-[#E5E5E5]" />
              ))}
            </div>

            <div className="h-8.75 w-full animate-pulse rounded-md bg-[#E5E5E5]" />
          </div>
        ))}

        <div className="h-5 w-36 animate-pulse rounded bg-[#E5E5E5]" />
      </div>
    </section>
  );
}
