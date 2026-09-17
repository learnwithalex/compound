export default function Loading() {
  return (
    <div className="animate-pulse p-14 pr-40">
      <div className="mb-2 h-3 w-24 rounded-full bg-[#f0f0f0]" />
      <div className="mb-8 h-7 w-56 rounded-full bg-[#f0f0f0]" />
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-sm bg-[#f0f0f0]" />
        ))}
      </div>
      <div className="mb-4 h-48 rounded-sm bg-[#f0f0f0]" />
      <div className="h-32 rounded-sm bg-[#f0f0f0]" />
    </div>
  );
}
