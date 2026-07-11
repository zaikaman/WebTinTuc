/** Content-area skeleton — avoids full-screen flash over the shared admin shell. */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      <div className="h-20 bg-white rounded-2xl border border-gray-100 shadow-sm" />
      <div className="h-14 bg-white rounded-2xl border border-gray-100 shadow-sm" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-white rounded-2xl border border-gray-100" />
        <div className="h-32 bg-white rounded-2xl border border-gray-100" />
        <div className="h-32 bg-white rounded-2xl border border-gray-100" />
      </div>
      <div className="h-64 bg-white rounded-2xl border border-gray-100" />
    </div>
  );
}
