export default function ReservePageSkeleton() {
  return <div role="status" className="space-y-5 px-2 md:px-5">
    <p className="text-center text-sm text-(--secondary-text)">در حال دریافت منوی غذا...</p>
    <div aria-hidden="true" className="h-11 rounded-xl bg-(--light-green)" />
    <div aria-hidden="true" className="grid max-w-3xl grid-cols-2 gap-3">
      {[0, 1].map((index) => <div key={index} className="space-y-4 rounded-xl border p-3">
        <div className="aspect-square rounded-lg bg-muted" /><div className="h-6 rounded bg-muted" />
        <div className="h-10 rounded bg-(--light-green)" />
      </div>)}
    </div>
  </div>;
}
