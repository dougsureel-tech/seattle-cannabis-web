export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-2 border-t-indigo-600 animate-spin" />
      </div>
      <p className="text-stone-400 text-sm font-medium animate-pulse">Loading…</p>
    </div>
  );
}
