"use client";

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse">
    {/* HEADER ACTION BANNER */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2.5 h-full bg-gray-250" />
      <div className="space-y-2 w-full max-w-[300px]">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded w-full"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
    </div>

    {/* FILTER BAR SECTION */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
        <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
        <div className="h-8 bg-gray-100 rounded-lg w-20"></div>
        <div className="h-8 bg-gray-100 rounded-lg w-20"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-100 rounded-xl w-24"></div>
        <div className="h-9 bg-gray-100 rounded-xl w-24"></div>
        <div className="h-9 bg-gray-200 rounded-xl w-16"></div>
      </div>
    </div>

    {/* METRICS CARDS SECTION */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="w-10 h-10 rounded-xl bg-gray-150"></div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="h-8 bg-gray-200 rounded-lg w-2/5"></div>
            <div className="h-4 bg-gray-100 rounded w-1/5"></div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-3/5"></div>
        </div>
      ))}
    </div>

    {/* CATEGORIES PROGRESS SECTION */}
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div className="space-y-2 w-full max-w-[200px]">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-150 rounded-lg w-20 animate-pulse"></div>
      </div>
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/85 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
          <div className="h-3 bg-gray-150 rounded w-36 animate-pulse"></div>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-gray-150/70 space-y-4 bg-slate-50/25 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-gray-200 rounded-r-md" />
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-2.5 bg-gray-150 rounded w-10 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-1.5 flex flex-col items-end">
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                <div className="h-2.5 bg-gray-150 rounded w-12 animate-pulse"></div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full pl-1">
              <div className="h-full bg-gray-200 rounded-full w-1/2 animate-pulse" />
            </div>
            <div className="flex justify-between items-center text-[10px] pl-1 pt-1">
              <div className="h-3 bg-gray-150 rounded w-14 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* BOTTOM COLUMNS */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="space-y-2 w-1/2">
            <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3.5 flex-1">
                <div className="w-6.5 h-6.5 rounded-full bg-gray-250 flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2.5 bg-gray-100 rounded w-1/5"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="space-y-2 w-1/2">
            <div className="h-5 bg-gray-250 rounded-lg w-1/2"></div>
            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
        </div>
        <div className="pl-6 border-l-2 border-gray-100 space-y-5 py-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="relative space-y-2">
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-gray-200 border-2 border-white"></div>
              <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2.5 bg-gray-100 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const LogoFooterSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
      <div className="space-y-2 w-full max-w-[300px]">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded w-full"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
    </div>
    <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
      <div className="h-5 bg-gray-200 rounded-lg w-1/4"></div>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-[90px] h-[90px] bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="space-y-3 flex-1 w-full">
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        <div className="h-9 bg-gray-200 rounded-xl w-28 flex-shrink-0"></div>
        <div className="h-9 bg-gray-100 rounded-xl w-28 flex-shrink-0"></div>
        <div className="h-9 bg-gray-100 rounded-xl w-28 flex-shrink-0"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PostsTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center"><div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div></td>
        <td className="py-4 px-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
        </td>
        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
        <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-6 bg-gray-150 rounded-full w-16 mx-auto"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-4 bg-gray-100 rounded w-20 mx-auto"></div></td>
        <td className="py-4 px-6 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const CategoriesTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center"><div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div></td>
        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
        <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-6 bg-gray-150 rounded-full w-16 mx-auto"></div></td>
        <td className="py-4 px-6 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const AdsTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center"><div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div></td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-7 rounded bg-gray-200 flex-shrink-0"></div>
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-100 rounded w-32"></div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
        <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-6 bg-gray-150 rounded-full w-16 mx-auto"></div></td>
        <td className="py-4 px-6 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const AccountsTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
        <td className="py-4 px-4"><div className="h-4 bg-gray-205 rounded w-44"></div></td>
        <td className="py-4 px-4 text-center"><div className="h-4 bg-gray-100 rounded w-24 mx-auto"></div></td>
        <td className="py-4 px-6 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);
