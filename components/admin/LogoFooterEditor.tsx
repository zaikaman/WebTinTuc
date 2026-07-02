"use client";

import React from "react";
import {
  Upload,
  X,
  Save,
} from "lucide-react";
import { LogoFooterSkeleton } from "./Skeletons";

interface LogoFooterEditorProps {
  settingsLoading: boolean;
  logoWebsiteName: string;
  logoUrl: string | null;
  footerOperator: string;
  footerAddress: string;
  footerResponsible: string;
  footerPhone: string;
  footerEmail: string;
  footerLicense: string;
  isSettingsSaving: boolean;
  onLogoWebsiteNameChange: (name: string) => void;
  onLogoUrlChange: (url: string | null) => void;
  onFooterOperatorChange: (val: string) => void;
  onFooterAddressChange: (val: string) => void;
  onFooterResponsibleChange: (val: string) => void;
  onFooterPhoneChange: (val: string) => void;
  onFooterEmailChange: (val: string) => void;
  onFooterLicenseChange: (val: string) => void;
  onSave: () => void;
  onLogoUpload: () => void;
}

export default function LogoFooterEditor({
  settingsLoading,
  logoWebsiteName,
  logoUrl,
  footerOperator,
  footerAddress,
  footerResponsible,
  footerPhone,
  footerEmail,
  footerLicense,
  isSettingsSaving,
  onLogoWebsiteNameChange,
  onLogoUrlChange,
  onFooterOperatorChange,
  onFooterAddressChange,
  onFooterResponsibleChange,
  onFooterPhoneChange,
  onFooterEmailChange,
  onFooterLicenseChange,
  onSave,
  onLogoUpload,
}: LogoFooterEditorProps) {
  if (settingsLoading) {
    return <LogoFooterSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* HEADER ACTION BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-teal-500 to-teal-600" />
        <div>
          <h2 className="text-xl font-black text-gray-900">🎨 Logo & Footer</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Tùy chỉnh logo và thông tin chân trang website</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSettingsSaving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-75"
        >
          <Save size={16} />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      {/* Logo Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-gray-900">Logo Website</h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Logo Preview */}
          <div className="w-[90px] h-[90px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload size={24} className="text-gray-300" />
            )}
          </div>

          <div className="space-y-3 flex-1 w-full">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Tên website</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoWebsiteName}
                  onChange={(e) => onLogoWebsiteNameChange(e.target.value)}
                  placeholder="Tên website..."
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={onLogoUpload}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
                >
                  Chọn logo
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => onLogoUrlChange(null)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900">Thông tin Footer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Đơn vị chủ quản</label>
            <input
              type="text"
              value={footerOperator}
              onChange={(e) => onFooterOperatorChange(e.target.value)}
              placeholder="Đơn vị chủ quản..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Địa chỉ</label>
            <input
              type="text"
              value={footerAddress}
              onChange={(e) => onFooterAddressChange(e.target.value)}
              placeholder="Địa chỉ..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Người chịu trách nhiệm</label>
            <input
              type="text"
              value={footerResponsible}
              onChange={(e) => onFooterResponsibleChange(e.target.value)}
              placeholder="Người chịu trách nhiệm..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Số điện thoại</label>
            <input
              type="text"
              value={footerPhone}
              onChange={(e) => onFooterPhoneChange(e.target.value)}
              placeholder="Số điện thoại..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Email</label>
            <input
              type="email"
              value={footerEmail}
              onChange={(e) => onFooterEmailChange(e.target.value)}
              placeholder="Email..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Giấy phép</label>
            <input
              type="text"
              value={footerLicense}
              onChange={(e) => onFooterLicenseChange(e.target.value)}
              placeholder="Giấy phép..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
