"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, HelpCircle } from "lucide-react";
import { Toaster, toast } from "sonner";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin đăng nhập!");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      if (loginUsername.trim() === "admin" && loginPassword.trim() === "123") {
        sessionStorage.setItem("admin_logged_in", "true");
        onLoginSuccess();
        toast.success("Đăng nhập quản trị thành công!");
      } else {
        toast.error("Tên đăng nhập hoặc mật khẩu không chính xác!");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 font-sans antialiased text-[#2c3e50] select-none">
      <Toaster position="top-right" richColors />
      <div className="max-w-[450px] w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        {/* Top colored stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#E55956]" />
        
        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#E55956]/10 flex items-center justify-center text-[#E55956] mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Trang Quản Trị</h1>
          <p className="text-sm text-gray-500 font-medium">Vui lòng đăng nhập để tiếp tục quản lý hệ thống</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tên đăng nhập</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Note Panel */}
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-8 tracking-normal space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-900">
              <HelpCircle size={14} />
              <span>Thông tin đăng nhập</span>
            </div>
            <p className="font-medium text-amber-800">Sử dụng tài khoản mặc định dưới đây để truy cập hệ thống:</p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-amber-100/50 p-1.5 rounded-lg border border-amber-200/40">
                <span className="text-amber-600 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Tài khoản</span>
                <strong className="text-amber-950 font-bold select-all">admin</strong>
              </div>
              <div className="bg-amber-100/50 p-1.5 rounded-lg border border-amber-200/40">
                <span className="text-amber-600 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Mật khẩu</span>
                <strong className="text-amber-950 font-bold select-all">123</strong>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#E55956] hover:bg-[#cb4643] disabled:opacity-75 text-white text-base font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 font-medium">
          Phát triển bởi Admin Control Center &copy; 2026
        </div>
      </div>
    </div>
  );
}
