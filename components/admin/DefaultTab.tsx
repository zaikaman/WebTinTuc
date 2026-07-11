"use client";

import { Search, Plus, SquarePen, Trash2, ExternalLink, ChevronDown, RotateCcw, Loader2 } from "lucide-react";
import { PostsTableSkeleton, CategoriesTableSkeleton, AdsTableSkeleton, AccountsTableSkeleton } from "./SkeletonLoaders";
import AdminPagination from "./AdminPagination";
import type { Post, Category, Ad, AdminAccount } from "./AdminTypes";

interface DefaultTabProps {
  activeTab: string;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  postStartDate: string;
  onPostStartDateChange: (d: string) => void;
  postEndDate: string;
  onPostEndDateChange: (d: string) => void;
  postCategoryFilter: string;
  onPostCategoryFilterChange: (f: string) => void;
  categoryOptions: string[];
  onResetFilters: () => void;
  hideDeletedPosts: boolean;
  onHideDeletedPostsChange: (v: boolean) => void;
  onOpenAddDialog: () => void;

  postsLoading: boolean;
  paginatedPosts: Post[];
  postsPage: number;
  postsTotalPages: number;
  onPostsPageChange: (p: number) => void;
  onPostEdit: (post: Post) => void;
  onPostDelete: (id: number) => void;
  onPostRestore?: (id: number) => void;
  restoringPostId?: number | null;

  categoriesLoading: boolean;
  paginatedCategories: Category[];
  categoriesPage: number;
  categoriesTotalPages: number;
  onCategoriesPageChange: (p: number) => void;
  onCategoryEdit: (cat: Category) => void;
  onCategoryDelete: (id: number) => void;
  onCategoryPriorityChange: (id: number, priority: number) => void;
  onCategoryStatusToggle: (cat: Category) => void;

  adsLoading: boolean;
  paginatedAds: Ad[];
  adsPage: number;
  adsTotalPages: number;
  onAdsPageChange: (p: number) => void;
  onAdEdit: (ad: Ad) => void;
  onAdDelete: (id: number) => void;
  onAdStatusToggle: (ad: Ad) => void;

  accountsLoading: boolean;
  paginatedAccounts: AdminAccount[];
  accountsPage: number;
  accountsTotalPages: number;
  onAccountsPageChange: (p: number) => void;
  onAccountEdit: (acc: AdminAccount) => void;
  onAccountDelete: (id: string) => void;

  formatDateForDisplay: (date: string) => string;
  /** Page size for STT calculation (accounts). Defaults to 6. */
  pageSize?: number;
}

export default function DefaultTab({
  activeTab,
  searchQuery,
  onSearchQueryChange,
  postStartDate,
  onPostStartDateChange,
  postEndDate,
  onPostEndDateChange,
  postCategoryFilter,
  onPostCategoryFilterChange,
  categoryOptions,
  onResetFilters,
  hideDeletedPosts,
  onHideDeletedPostsChange,
  onOpenAddDialog,
  postsLoading,
  paginatedPosts,
  postsPage,
  postsTotalPages,
  onPostsPageChange,
  onPostEdit,
  onPostDelete,
  onPostRestore,
  restoringPostId = null,
  categoriesLoading,
  paginatedCategories,
  categoriesPage,
  categoriesTotalPages,
  onCategoriesPageChange,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryPriorityChange,
  onCategoryStatusToggle,
  adsLoading,
  paginatedAds,
  adsPage,
  adsTotalPages,
  onAdsPageChange,
  onAdEdit,
  onAdDelete,
  onAdStatusToggle,
  accountsLoading,
  paginatedAccounts,
  accountsPage,
  accountsTotalPages,
  onAccountsPageChange,
  onAccountEdit,
  onAccountDelete,
  formatDateForDisplay,
  pageSize = 6,
}: DefaultTabProps) {
  const currentPage =
    activeTab === "posts" ? postsPage
    : activeTab === "categories" ? categoriesPage
    : activeTab === "ads" ? adsPage
    : accountsPage;

  const totalPages =
    activeTab === "posts" ? postsTotalPages
    : activeTab === "categories" ? categoriesTotalPages
    : activeTab === "ads" ? adsTotalPages
    : accountsTotalPages;

  const setPage = (page: number) => {
    if (activeTab === "posts") onPostsPageChange(page);
    else if (activeTab === "categories") onCategoriesPageChange(page);
    else if (activeTab === "ads") onAdsPageChange(page);
    else if (activeTab === "accounts") onAccountsPageChange(page);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER ACTION BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {activeTab === "posts" && "Danh sách tất cả bài viết trên hệ thống"}
            {activeTab === "categories" && "Quản lý luồng chủ đề danh mục tin tức"}
            {activeTab === "ads" && "Theo dõi hiệu suất và vị trí các banner quảng cáo"}
            {activeTab === "accounts" && "Danh sách tất cả tài khoản quản trị viên trên hệ thống"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Dễ dàng tìm kiếm, lọc, thêm mới hoặc cập nhật các bản ghi theo thời gian thực.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddDialog}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
        >
          <Plus size={16} />
          <span>
            {activeTab === "posts" && "Thêm bài viết"}
            {activeTab === "categories" && "Thêm danh mục"}
            {activeTab === "ads" && "Thêm quảng cáo"}
            {activeTab === "accounts" && "Thêm tài khoản"}
          </span>
        </button>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          {/* Search Field */}
          <div className={activeTab === "posts" ? "md:col-span-4" : "md:col-span-12"}>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              Tìm kiếm thông tin
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder={
                  activeTab === "posts"
                    ? "Tìm kiếm tiêu đề bài viết..."
                    : activeTab === "categories"
                      ? "Tìm tên danh mục, ID..."
                      : activeTab === "ads"
                        ? "Tìm kiếm tên AD, vị trí, ID..."
                        : "Tìm kiếm username, tên hiển thị, email..."
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
              />
            </div>
          </div>

          {/* Date & Category filters only for POSTS */}
          {activeTab === "posts" && (
            <>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={postStartDate}
                  onChange={(e) => onPostStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={postEndDate}
                  onChange={(e) => onPostEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Danh mục
                </label>
                <select
                  value={postCategoryFilter}
                  onChange={(e) => onPostCategoryFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                >
                  <option value="all">Tất cả</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-bold rounded-xl transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>

              <div className="md:col-span-9 flex items-center mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 font-medium select-none w-max">
                  <input
                    type="checkbox"
                    checked={hideDeletedPosts}
                    onChange={(e) => onHideDeletedPostsChange(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E55956] focus:ring-[#E55956] cursor-pointer"
                  />
                  Ẩn bài viết đã xóa
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DATA TABLE WRAPPER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* VIEW: POSTS TABLE */}
          {activeTab === "posts" && (
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                  <th className="py-4 px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-4 min-w-[280px]">Tiêu đề bài viết</th>
                  <th className="py-4 px-4 w-40">Danh mục</th>
                  <th className="py-4 px-4 w-32 text-right">Lượt xem</th>
                  <th className="py-4 px-4 w-36 text-center">Trạng thái</th>
                  <th className="py-4 px-4 w-40 text-center">Ngày tạo</th>
                  <th className="py-4 px-6 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {postsLoading ? (
                  <PostsTableSkeleton />
                ) : paginatedPosts.length > 0 ? (
                  paginatedPosts.map((post) => (
                    <tr key={post.id} className={`transition-colors text-sm font-medium whitespace-nowrap ${post.isDeleted ? 'opacity-70 bg-red-50/30' : 'hover:bg-gray-50/50'}`}>
                      <td className="py-4 px-6 text-center text-gray-400 font-bold">{post.id}</td>
                      <td className="py-4 px-4 whitespace-normal">
                        <div className="flex items-center gap-3">
                          {post.coverImage ? (
                            <img src={post.coverImage} alt={post.title} className="w-12 h-8 rounded object-cover border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-8 rounded bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                              No Image
                            </div>
                          )}
                          <div className="min-w-0 flex flex-col gap-1">
                            <span className="text-gray-900 font-semibold truncate max-w-[300px]" title={post.title}>{post.title}</span>
                            {post.isDeleted && (
                              <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                Đã xóa
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-center">{post.category}</td>
                      <td className="py-4 px-4 text-right text-gray-900 font-mono font-bold">
                        {post.views.toLocaleString("en-US")}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${post.status === "Đã đăng" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500">
                        {formatDateForDisplay(post.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          {post.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => onPostRestore?.(post.id!)}
                              disabled={restoringPostId === post.id}
                              className="p-1.5 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-60"
                              title="Khôi phục bài viết"
                            >
                              {restoringPostId === post.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <RotateCcw size={15} />
                              )}
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onPostEdit(post)}
                                className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                title="Sửa bài viết"
                              >
                                <SquarePen size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onPostDelete(post.id!)}
                                className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Xóa bài viết"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">
                      Không tìm thấy bài viết nào tương ứng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* VIEW: CATEGORIES TABLE */}
          {activeTab === "categories" && (
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                  <th className="py-4 px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-4 min-w-[200px]">Tên danh mục</th>
                  <th className="py-4 px-4 w-28 text-center">Priority</th>
                  <th className="py-4 px-4 w-28 text-center">Bài viết</th>
                  <th className="py-4 px-4 w-36 text-center">Trạng thái</th>
                  <th className="py-4 px-6 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {categoriesLoading ? (
                  <CategoriesTableSkeleton />
                ) : paginatedCategories.length > 0 ? (
                  paginatedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors text-sm font-medium whitespace-nowrap">
                      <td className="py-4 px-6 text-center text-gray-400 font-bold">{cat.id}</td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 font-semibold">{cat.name}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="relative inline-flex items-center">
                          <select
                            value={cat.priority}
                            onChange={(e) => onCategoryPriorityChange(cat.id!, Number(e.target.value))}
                            className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#E55956] appearance-none pr-6 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            {Array.from({ length: 11 }).map((_, i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600">{cat.postCount ?? 0}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onCategoryStatusToggle(cat)}
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${cat.status === "Hoạt động"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                        >
                          {cat.status}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => onCategoryEdit(cat)}
                            className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            <SquarePen size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCategoryDelete(cat.id!)}
                            className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-bold">
                      Không tìm thấy danh mục nào tương ứng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* VIEW: ADS TABLE */}
          {activeTab === "ads" && (
            <table className="w-full min-w-[950px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                  <th className="py-4 px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-4 min-w-[250px]">Tên AD</th>
                  <th className="py-4 px-4 w-36">Vị trí</th>
                  <th className="py-4 px-4 w-32 text-right">Clicks</th>
                  <th className="py-4 px-4 w-36 text-center">Thời gian BĐ</th>
                  <th className="py-4 px-4 w-36 text-center">Thời gian KT</th>
                  <th className="py-4 px-4 w-36 text-center">Trạng thái</th>
                  <th className="py-4 px-6 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {adsLoading ? (
                  <AdsTableSkeleton />
                ) : paginatedAds.length > 0 ? (
                  paginatedAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors text-sm font-medium whitespace-nowrap">
                      <td className="py-4 px-6 text-center text-gray-400 font-bold">{ad.id}</td>
                      <td className="py-4 px-4 whitespace-normal">
                        <div className="flex items-center gap-3">
                          {ad.image ? (
                            ad.link ? (
                              <a
                                href={ad.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-12 h-7 rounded overflow-hidden border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                                title="Click to visit link"
                              >
                                <img src={ad.image} alt={ad.name} className="w-full h-full object-cover" />
                              </a>
                            ) : (
                              <div className="relative w-12 h-7 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                                <img src={ad.image} alt={ad.name} className="w-full h-full object-cover" />
                              </div>
                            )
                          ) : (
                            <div className="w-12 h-7 rounded bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                              No Image
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-gray-900 font-semibold truncate max-w-[200px]" title={ad.name}>{ad.name}</span>
                            {ad.link ? (
                              <a
                                href={ad.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#E55956] hover:underline flex items-center gap-0.5 mt-0.5 font-bold"
                              >
                                <ExternalLink size={10} className="flex-shrink-0" />
                                <span className="truncate max-w-[150px]">{ad.link}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium mt-0.5">(Không có link)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-bold">{ad.position}</td>
                      <td className="py-4 px-4 text-right text-gray-900 font-mono font-bold">
                        {ad.clicks.toLocaleString("en-US")}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500">
                        {formatDateForDisplay(ad.startDate)}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500">
                        {formatDateForDisplay(ad.endDate)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onAdStatusToggle(ad)}
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${ad.status === "Hoạt động"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : ad.status === "Chờ chạy"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : ad.status === "Đã kết thúc"
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                        >
                          {ad.status}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => onAdEdit(ad)}
                            className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            <SquarePen size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdDelete(ad.id!)}
                            className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 font-bold">
                      Không tìm thấy quảng cáo nào tương ứng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* VIEW: ACCOUNTS TABLE */}
          {activeTab === "accounts" && (
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                  <th className="py-4 px-6 w-16 text-center">STT</th>
                  <th className="py-4 px-4 min-w-[200px]">Tên đăng nhập</th>
                  <th className="py-4 px-4 min-w-[200px]">Tên hiển thị</th>
                  <th className="py-4 px-4 w-44">Email</th>
                  <th className="py-4 px-4 w-40 text-center">Ngày tạo</th>
                  <th className="py-4 px-6 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {accountsLoading ? (
                  <AccountsTableSkeleton />
                ) : paginatedAccounts.length > 0 ? (
                  paginatedAccounts.map((acc, index) => (
                    <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors text-sm font-medium whitespace-nowrap">
                      <td className="py-4 px-6 text-center text-gray-400 font-bold">
                        {(accountsPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-semibold">{acc.username}</td>
                      <td className="py-4 px-4 text-gray-750">{acc.display_name}</td>
                      <td className="py-4 px-4 text-gray-600">{acc.email || "(Chưa cấu hình)"}</td>
                      <td className="py-4 px-4 text-center text-gray-500">
                        {formatDateForDisplay(acc.created_at ? acc.created_at.split("T")[0] : "")}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => onAccountEdit(acc)}
                            className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                            title="Sửa tài khoản"
                          >
                            <SquarePen size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onAccountDelete(acc.id!)}
                            className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">
                      Không tìm thấy tài khoản nào tương ứng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION CONTROLLER */}
        <div className="py-4 px-6 border-t border-gray-150 flex items-center justify-center">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
