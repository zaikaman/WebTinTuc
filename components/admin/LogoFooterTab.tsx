"use client";

import { Download, Loader2, Upload } from "lucide-react";
import { LogoFooterSkeleton } from "./SkeletonLoaders";

interface LogoFooterTabProps {
  loading: boolean;
  isSaving: boolean;
  logoUrl: string | null;
  logoWebsiteName: string;
  headerZaloUrl: string;
  headerEmailUrl: string;
  footerOperator: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerLicense: string;
  footerResponsible: string;
  onLogoUrlChange: (url: string | null) => void;
  onLogoWebsiteNameChange: (name: string) => void;
  onHeaderZaloUrlChange: (url: string) => void;
  onHeaderEmailUrlChange: (url: string) => void;
  onFooterOperatorChange: (val: string) => void;
  onFooterAddressChange: (val: string) => void;
  onFooterPhoneChange: (val: string) => void;
  onFooterEmailChange: (val: string) => void;
  onFooterLicenseChange: (val: string) => void;
  onFooterResponsibleChange: (val: string) => void;
  onSave: () => void;
  onUploadLogo: (file: File) => void;
}

export default function LogoFooterTab({
  loading,
  isSaving,
  logoUrl,
  logoWebsiteName,
  headerZaloUrl,
  headerEmailUrl,
  footerOperator,
  footerAddress,
  footerPhone,
  footerEmail,
  footerLicense,
  footerResponsible,
  onLogoUrlChange,
  onLogoWebsiteNameChange,
  onHeaderZaloUrlChange,
  onHeaderEmailUrlChange,
  onFooterOperatorChange,
  onFooterAddressChange,
  onFooterPhoneChange,
  onFooterEmailChange,
  onFooterLicenseChange,
  onFooterResponsibleChange,
  onSave,
  onUploadLogo,
}: LogoFooterTabProps) {
  if (loading) {
    return <LogoFooterSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* CARD 1: Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Quản lý Footer & Nhận diện
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Chỉnh sửa thông tin hiển thị cuối trang và logo website
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>Lưu thay đổi</span>
        </button>
      </div>

      {/* CARD 2: Logo Website */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          Logo website
        </h3>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Dashed Upload Box */}
          <div className="flex flex-col items-center flex-shrink-0">
            <label
              htmlFor="logo-upload-input"
              className="w-[90px] h-[90px] border-2 border-dashed border-gray-200 hover:border-[#E55956] rounded-xl flex items-center justify-center bg-gray-50/50 cursor-pointer overflow-hidden transition-all group relative"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#E55956] transition-colors">
                  <Upload size={20} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                Đổi ảnh
              </div>
            </label>
            <input
              type="file"
              id="logo-upload-input"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUploadLogo(file);
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-1 mt-2">
              <button
                type="button"
                onClick={() => document.getElementById("logo-upload-input")?.click()}
                className="text-[#E55956] hover:text-[#cb4643] text-xs font-bold transition-colors cursor-pointer"
              >
                Đổi logo
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => onLogoUrlChange(null)}
                  className="text-red-500 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Xóa logo
                </button>
              )}
            </div>
          </div>

          {/* Logo name input */}
          <div className="w-full sm:flex-1 space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Tên website
            </label>
            <input
              type="text"
              value={logoWebsiteName}
              onChange={(e) => onLogoWebsiteNameChange(e.target.value)}
              placeholder="Nhập tên website..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* CARD 2.5: Cấu hình Mạng xã hội Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-gray-900">
          Cấu hình Mạng xã hội Header
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Link Zalo (Header)
            </label>
            <input
              type="text"
              value={headerZaloUrl}
              onChange={(e) => onHeaderZaloUrlChange(e.target.value)}
              placeholder="VD: https://zalo.me/sdt"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Link Email (Header)
            </label>
            <input
              type="text"
              value={headerEmailUrl}
              onChange={(e) => onHeaderEmailUrlChange(e.target.value)}
              placeholder="VD: mailto:quangcao@linhka.vn"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* CARD 3: Thông tin Footer */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-gray-900">
          Thông tin Footer
        </h3>

        <div className="space-y-4">
          {/* Don vi van hanh */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Đơn vị vận hành
            </label>
            <input
              type="text"
              value={footerOperator}
              onChange={(e) => onFooterOperatorChange(e.target.value)}
              placeholder="Nhập đơn vị vận hành..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>

          {/* Dia chi */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Địa chỉ
            </label>
            <input
              type="text"
              value={footerAddress}
              onChange={(e) => onFooterAddressChange(e.target.value)}
              placeholder="Nhập địa chỉ..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>

          {/* Nguoi chiu trach nhiem */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Người chịu trách nhiệm nội dung
            </label>
            <input
              type="text"
              value={footerResponsible}
              onChange={(e) => onFooterResponsibleChange(e.target.value)}
              placeholder="Nhập người chịu trách nhiệm..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>

          {/* So dien thoai */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Số điện thoại
            </label>
            <input
              type="text"
              value={footerPhone}
              onChange={(e) => onFooterPhoneChange(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={footerEmail}
              onChange={(e) => onFooterEmailChange(e.target.value)}
              placeholder="Nhập địa chỉ email..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>

          {/* Giay phep */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-600">
              Giấy phép thiết lập trang TTDT
            </label>
            <input
              type="text"
              value={footerLicense}
              onChange={(e) => onFooterLicenseChange(e.target.value)}
              placeholder="Nhập số giấy phép..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
