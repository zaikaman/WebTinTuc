"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  Folder,
  Image as ImageIcon,
  Search,
  SquarePen,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  TrendingUp,
  LayoutDashboard,
  ArrowLeft,
  Save,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Video,
  Upload,
  ChevronDown,
  Download,
  Eye,
  MousePointerClick,
  Lock,
  EyeOff,
  LogOut,
  Copy,
  ExternalLink,
  RotateCcw,
  Crop
} from "lucide-react";
import { getAdminSettings, updateAdminSettings, getAdminMedia, uploadAdminMedia, deleteAdminMedia, createAdminFolder, getAdminDashboardStats, getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory, getAdminArticles, createAdminArticle, updateAdminArticle, deleteAdminArticle, restoreAdminArticle, getAdminAds, createAdminAd, updateAdminAd, deleteAdminAd, getAdminAccounts, createAdminAccount, updateAdminAccount, deleteAdminAccount } from "@/lib/api/adminClient";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { mockSiteSettings } from "@/lib/mockSiteSettings";
import { supabase } from "@/lib/supabase/client";

const htmlToBlocks = (html: string) => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: any[] = [];
  
  doc.body.childNodes.forEach((node) => {
    if (node.nodeName === 'P') {
      const el = node as HTMLElement;
      if (el.querySelector('strong')) {
        blocks.push({ type: 'bold-paragraph', text: el.textContent || '' });
      } else {
        blocks.push({ type: 'paragraph', text: el.textContent || '' });
      }
    } else if (node.nodeName === 'DIV') {
      const el = node as HTMLElement;
      const img = el.querySelector('img');
      const video = el.querySelector('video');
      const iframe = el.querySelector('iframe');
      if (img) {
        const src = img.getAttribute('src');
        const pTags = el.querySelectorAll('p');
        let caption = '';
        if (pTags.length > 0) caption = pTags[pTags.length - 1].textContent || '';
        if (!caption && img.getAttribute('alt')) caption = img.getAttribute('alt') || '';
        
        if (src) {
          const width = el.style.maxWidth || el.style.width || '';
          blocks.push({ type: 'image', src, caption, width });
        }
      } else if (video) {
        const src = video.getAttribute('src');
        if (src) {
          const width = el.style.maxWidth || el.style.width || '';
          blocks.push({ type: 'video', src, width });
        }
      } else if (iframe) {
        const src = iframe.getAttribute('src');
        if (src) {
          const width = el.style.maxWidth || el.style.width || '';
          blocks.push({ type: 'iframe', src, width });
        }
      } else {
        if (el.getAttribute('contenteditable') !== 'false' && el.textContent?.trim()) {
           blocks.push({ type: 'paragraph', text: el.textContent });
        }
      }
    } else if (node.nodeName === 'VIDEO') {
      const el = node as HTMLElement;
      const src = el.getAttribute('src');
      if (src) {
        blocks.push({ type: 'video', src });
      }
    } else if (node.nodeName === 'IFRAME') {
      const el = node as HTMLElement;
      const src = el.getAttribute('src');
      if (src) {
        blocks.push({ type: 'iframe', src });
      }
    } else if (node.nodeName === 'UL' || node.nodeName === 'OL') {
      const el = node as HTMLElement;
      el.querySelectorAll('li').forEach(li => {
        blocks.push({ type: 'paragraph', text: li.textContent || '' });
      });
    }
  });
  return blocks;
};

const blocksToHtml = (blocks: any[]) => {
  if (!Array.isArray(blocks)) return typeof blocks === 'string' ? blocks : '';
  const htmlList = blocks.map(block => {
    if (block.type === "paragraph") {
      return `<p>${block.text || ''}</p>`;
    } else if (block.type === "bold-paragraph") {
      return `<p><strong>${block.text || ''}</strong></p>`;
    } else if (block.type === "image") {
      const width = block.width || "100%";
      const wrapperId = "img-" + Math.random().toString(36).substring(2, 9);
      return `<div id="${wrapperId}" class="my-4 relative group" contenteditable="false" style="max-width: ${width}; margin: 0 auto;">
  <img src="${block.src || ''}" alt="${block.caption || ''}" class="w-full rounded-xl border border-gray-200 shadow-sm" />
  ${block.caption ? `<p class="text-center text-xs italic text-gray-500 mt-1.5">${block.caption}</p>` : ''}
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa hình ảnh">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); const img=p.querySelector('img'); if(img) { window.dispatchEvent(new CustomEvent('editor-crop-image', { detail: { src: img.src, id: p.id } })); }" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>
      Cắt ảnh
    </button>
  </div>
</div>`;
    } else if (block.type === "video") {
      const width = block.width || "100%";
      return `<div class="my-4 relative group" contenteditable="false" style="max-width: ${width}; margin: 0 auto;">
  <video controls src="${block.src || ''}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div>`;
    } else if (block.type === "iframe") {
      const width = block.width || "100%";
      return `<div class="my-4 relative group" contenteditable="false" style="max-width: ${width}; margin: 0 auto;">
  <iframe class="w-full aspect-video rounded-xl shadow-sm border border-gray-200" src="${block.src || ''}" frameborder="0" allowfullscreen></iframe>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video nhúng">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div>`;
    }
    return '';
  });

  const lastBlock = blocks[blocks.length - 1];
  if (lastBlock && (lastBlock.type === 'image' || lastBlock.type === 'video' || lastBlock.type === 'iframe')) {
    htmlList.push('<p><br></p>');
  }

  return htmlList.join('\n');
};

// ==========================================
// TYPES
// ==========================================
interface Post {
  id: number;
  title: string;
  category: string;
  views: number;
  status: "Đã đăng" | "Nháp";
  createdAt: string;
  content?: string;
  coverImage?: string;
  isDeleted?: boolean;
}

interface Category {
  id: number;
  name: string;
  postCount: number;
  priority: number;
  status: "Hoạt động" | "Ngừng hoạt động" | "Chờ chạy" | "Đã kết thúc";
}

interface Ad {
  id: number;
  name: string;
  position: string;
  clicks: number;
  startDate: string;
  endDate: string;
  status: "Hoạt động" | "Ngừng hoạt động" | "Chờ chạy" | "Đã kết thúc" | string;
  image?: string;
  link?: string;
}

interface AdminAccount {
  id: string;
  username: string;
  display_name: string;
  avatar_key?: string | null;
  role: string;
  email?: string | null;
  created_at: string;
  updated_at?: string;
}

type TabType = "dashboard" | "posts" | "categories" | "ads" | "logo-footer" | "media" | "accounts";

// ==========================================
// SKELETON LOADERS
// ==========================================
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded-lg w-1/5"></div>
        <div className="h-3 bg-gray-100 rounded w-1/4"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4.5 rounded-xl border border-gray-100 space-y-4 bg-slate-50/25">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full"></div>
            <div className="h-3 bg-gray-100 rounded w-12 ml-auto"></div>
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

const LogoFooterSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* CARD 1: Header action */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
      <div className="space-y-2 w-full max-w-[300px]">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded w-full"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
    </div>

    {/* CARD 2: Logo Website */}
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

    {/* CARD 3: Footer settings tabs */}
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

const PostsTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center">
          <div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div>
        </td>
        <td className="py-4 px-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-6 bg-gray-150 rounded-full w-16 mx-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-4 bg-gray-100 rounded w-20 mx-auto"></div>
        </td>
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

const CategoriesTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center">
          <div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div>
        </td>
        <td className="py-4 px-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-6 bg-gray-150 rounded-full w-16 mx-auto"></div>
        </td>
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

const AdsTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center">
          <div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-7 rounded bg-gray-200 flex-shrink-0"></div>
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-100 rounded w-32"></div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-6 bg-gray-150 rounded-full w-16 mx-auto"></div>
        </td>
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

const AccountsTableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6 text-center">
          <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
        </td>
        <td className="py-4 px-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="py-4 px-4">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </td>
        <td className="py-4 px-4">
          <div className="h-4 bg-gray-205 rounded w-44"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-6 bg-gray-150 rounded-full w-20 mx-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="h-4 bg-gray-100 rounded w-24 mx-auto"></div>
        </td>
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

let cachedSettings: any = null;

export default function AdminDashboard() {
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  // isLoggedIn đọc trực tiếp từ localStorage (đồng bộ) ngay lần render đầu tiên
  // để tránh flicker màn hình login khi chuyển tab
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin_logged_in') === 'true';
  });
  const [isAuthVerified, setIsAuthVerified] = useState<boolean>(false);
  const isExplicitLogoutRef = useRef(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Logic kiểm tra quyền truy cập và chuyển hướng
  useEffect(() => {
    // Chỉ thực hiện chuyển hướng khi quá trình xác thực phiên (verifySession) đã hoàn tất
    if (!isAuthVerified) return;

    // 1. Nếu CHƯA đăng nhập và cố truy cập các trang con /admin/... (trừ /admin và /admin/)
    if (!isLoggedIn && pathname && pathname !== "/admin" && pathname !== "/admin/") {
      router.replace("/admin");
      
      // Nếu là hành động đăng xuất chủ động, không hiện toast warning "vui lòng đăng nhập trước"
      if (isExplicitLogoutRef.current) {
        isExplicitLogoutRef.current = false;
      } else {
        toast.warning("Vui lòng đăng nhập trước!");
      }
    }

    // 2. Nếu ĐÃ đăng nhập và đang ở trang đăng nhập gốc /admin hoặc /admin/
    if (isLoggedIn && (pathname === "/admin" || pathname === "/admin/")) {
      router.replace("/admin/dashboard");
    }
  }, [isLoggedIn, isAuthVerified, pathname, router]);

  useEffect(() => {
    // Xác thực lại session Supabase khi component mount lần đầu
    // Nếu localStorage nói đã đăng nhập nhưng session Supabase đã hết hạn → logout
    const verifySession = async () => {
      const cached = localStorage.getItem('admin_logged_in');
      if (cached !== 'true') {
        setIsAuthVerified(true);
        return; // Chưa đăng nhập, không cần verify
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Session hết hạn, dọn dẹp cache
          localStorage.removeItem('admin_logged_in');
          setIsLoggedIn(false);
        }
      } catch {
        // Nếu lỗi network khi verify, vẫn tin vào localStorage (UX tốt hơn)
      } finally {
        setIsAuthVerified(true); // Đã xác thực xong
      }
    };
    verifySession();

    const handleCropEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCropImageUrl(detail.src);
      setCropImageElementId(detail.id);
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
      setCropDialogOpen(true);
    };
    window.addEventListener("editor-crop-image", handleCropEvent);
    return () => {
      window.removeEventListener("editor-crop-image", handleCropEvent);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin đăng nhập!");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginUsername.trim(),
        password: loginPassword,
      });

      if (error || !data.user) {
        toast.error("Email hoặc mật khẩu không chính xác!");
        return;
      }

      // Kiểm tra role admin trong bảng profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error("Tài khoản này không có quyền quản trị!");
        return;
      }

      localStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      setIsAuthVerified(true);
      toast.success("Đăng nhập quản trị thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      isExplicitLogoutRef.current = true;
      await supabase.auth.signOut();
    } catch {
      // bỏ qua lỗi signOut
    } finally {
      localStorage.removeItem('admin_logged_in');
      setIsLoggedIn(false);
      setIsAuthVerified(true);
      setLogoutDialogOpen(false);
      toast.success("Đã đăng xuất khỏi hệ thống!");
    }
  };

  const activeTab = useMemo<TabType>(() => {
    const segment = pathname?.split("/").pop();
    if (segment === "admin" || !segment) return "dashboard";
    return (segment as TabType) || "dashboard";
  }, [pathname]);

  // ==========================================
  // LOGO & FOOTER + MEDIA MANAGER STATES
  // ==========================================
  interface MediaItem {
    id: number;
    key: string;
    title: string;
    type: "image" | "video";
    url: string;
    size: string;
    dimensions?: string;
    duration?: string;
    createdAt: string;
    folder?: string;
  }

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const [, setSiteSettings] = useState(() => cachedSettings || mockSiteSettings);

  // Simplified Logo & Footer states matching screenshot
  const [logoWebsiteName, setLogoWebsiteName] = useState(() => cachedSettings?.brand?.name || "Tên Web");
  const [logoUrl, setLogoUrl] = useState<string | null>(() => cachedSettings?.brand?.logo_url || null);
  const [footerOperator, setFooterOperator] = useState(() => cachedSettings?.brand?.copyright || "Công ty TNHH PHD STUDIO");
  const [footerAddress, setFooterAddress] = useState(() => cachedSettings?.footer?.address || "246 Lê Đình Cẩn, phường Tân Tạo, quận Bình Tân, Thành phố Hồ Chí Minh");
  const [footerResponsible, setFooterResponsible] = useState(() => cachedSettings?.footer?.responsible || "Ông Phạm Hải Đăng");
  const [footerPhone, setFooterPhone] = useState(() => cachedSettings?.footer?.phone || "0327906965");
  const [footerEmail, setFooterEmail] = useState(() => cachedSettings?.footer?.email || "congtyphdstudio@gmail.com");
  const [footerLicense, setFooterLicense] = useState(() => cachedSettings?.footer?.license || "Số bao nhiêu ....");

  // Header Contact & Social states
  const [headerAdsContactText, setHeaderAdsContactText] = useState(() => cachedSettings?.brand?.utilityLinks?.[0]?.label || "Liên hệ quảng cáo");
  const [headerAdsContactUrl, setHeaderAdsContactUrl] = useState(() => cachedSettings?.brand?.utilityLinks?.[0]?.href || "");
  const [headerZaloUrl, setHeaderZaloUrl] = useState(() => cachedSettings?.brand?.socialLinks?.find((l: any) => l.platform === 'zalo')?.href || "https://zalo.me");
  const [headerEmailUrl, setHeaderEmailUrl] = useState(() => cachedSettings?.brand?.socialLinks?.find((l: any) => l.platform === 'email')?.href || "mailto:quangcao@linhka.vn");

  const [mediaSort, setMediaSort] = useState<"newest" | "oldest" | "az">("newest");

  const [mediaPreviewItem, setMediaPreviewItem] = useState<MediaItem | null>(null);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");
  const [activeFolder, setActiveFolder] = useState<string>("");
  const [folders, setFolders] = useState<string[]>([]);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageTab, setImageTab] = useState<"link" | "upload" | "library">("link");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [videoTab, setVideoTab] = useState<"link" | "upload" | "library">("link");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropImageElementId, setCropImageElementId] = useState("");
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    type: 'drag' | 'resize';
    handle?: string;
    startX: number;
    startY: number;
    startArea: { x: number; y: number; width: number; height: number };
  } | null>(null);

  useEffect(() => {
    if (!dragState || !cropContainerRef.current) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = cropContainerRef.current!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaXPercent = ((clientX - dragState.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - dragState.startY) / rect.height) * 100;

      if (dragState.type === 'drag') {
        let newX = dragState.startArea.x + deltaXPercent;
        let newY = dragState.startArea.y + deltaYPercent;

        // Constraint check: stay within 0 - 100%
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + dragState.startArea.width > 100) newX = 100 - dragState.startArea.width;
        if (newY + dragState.startArea.height > 100) newY = 100 - dragState.startArea.height;

        setCropArea(prev => ({
          ...prev,
          x: Math.round(newX),
          y: Math.round(newY)
        }));
      } else if (dragState.type === 'resize' && dragState.handle) {
        let newX = dragState.startArea.x;
        let newY = dragState.startArea.y;
        let newW = dragState.startArea.width;
        let newH = dragState.startArea.height;

        const handle = dragState.handle;

        if (handle.includes('e')) {
          newW = dragState.startArea.width + deltaXPercent;
        }
        if (handle.includes('w')) {
          const possibleX = dragState.startArea.x + deltaXPercent;
          if (possibleX >= 0) {
            newX = possibleX;
            newW = dragState.startArea.width - deltaXPercent;
          }
        }
        if (handle.includes('s')) {
          newH = dragState.startArea.height + deltaYPercent;
        }
        if (handle.includes('n')) {
          const possibleY = dragState.startArea.y + deltaYPercent;
          if (possibleY >= 0) {
            newY = possibleY;
            newH = dragState.startArea.height - deltaYPercent;
          }
        }

        // Min size constraints (e.g. 10%)
        if (newW < 10) newW = 10;
        if (newH < 10) newH = 10;

        // Boundary constraints
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + newW > 100) newW = 100 - newX;
        if (newY + newH > 100) newH = 100 - newY;

        setCropArea({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH)
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragState]);

  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "year">("month");
  const [dashboardDay, setDashboardDay] = useState("");
  const [dashboardMonth, setDashboardMonth] = useState("");
  const [dashboardYear, setDashboardYear] = useState("");

  const loadDashboardStats = async () => {
    try {
      setDashboardLoading(true);
      const res = await getAdminDashboardStats();
      if (res) {
        setDashboardData(res);
      }
    } catch (err) {
      toast.error("Không thể tải dữ liệu thống kê dashboard");
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const res = await getAdminMedia("");
      if (res && res.subFolders) {
        const uniqueFolders = Array.from(new Set([
          ...res.subFolders.map((sf) => sf.name),
          "articles", "ads", "categories" // default folders
        ]));
        setFolders(uniqueFolders);
      }
    } catch (err) {}
  };

  const loadMedia = async () => {
    try {
      setMediaLoading(true);
      // We always load recursively from root to keep a full cache of media files
      const res = await getAdminMedia("", true);
      if (res && res.files) {
        setMediaItems(res.files.map((f: any, idx: number) => ({
          id: idx + 1,
          key: f.key,
          title: f.name,
          type: f.type,
          url: f.url,
          size: (f.size / 1024).toFixed(2) + " KB",
          createdAt: f.lastModified ? new Date(f.lastModified).toISOString().split("T")[0] : "",
          folder: f.key.includes('/') ? f.key.split('/')[0] : ""
        })));
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setMediaLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);
      const res = await getAdminAccounts("?limit=100");
      if (res && res.items) {
        setAccounts(res.items);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setAccountsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await getAdminCategories("?limit=100");
      if (res && res.items) {
        setCategories(res.items.map((c: any) => ({
          id: c.id,
          name: c.name,
          postCount: c.postCount || 0,
          priority: c.priority || 0,
          status: c.status === "active" ? "Hoạt động" : "Ngừng hoạt động"
        })));
      }
    } catch (err) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadAds = async () => {
    try {
      setAdsLoading(true);
      const res = await getAdminAds("?limit=100");
      setAds((res.items || []).map((a: any) => {
        const now = new Date();
        
        // Parse dates safely using the YYYY-MM-DD part
        const startDateStr = a.starts_at ? a.starts_at.split('T')[0] : null;
        const endDateStr = a.ends_at ? a.ends_at.split('T')[0] : null;
        
        const start = startDateStr ? new Date(startDateStr + 'T00:00:00') : null;
        const end = endDateStr ? new Date(endDateStr + 'T23:59:59') : null;
        
        let computedStatus = "Ngừng hoạt động";
        
        if (a.status === "active") {
          if (end && end < now) computedStatus = "Đã kết thúc";
          else if (start && start > now) computedStatus = "Chờ chạy";
          else computedStatus = "Hoạt động";
        }

        return {
          id: a.id,
          name: a.name,
          position: a.position || "header",
          clicks: a.stats?.clicks || 0,
          startDate: a.starts_at ? new Date(a.starts_at).toISOString().split('T')[0] : "",
          endDate: a.ends_at ? new Date(a.ends_at).toISOString().split('T')[0] : "",
          status: computedStatus,
          image: a.media_key || undefined,
          link: a.target_url || undefined,
        } as Ad;
      }));
    } catch (err) {
      // Ignore
    } finally {
      setAdsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await getAdminArticles("?limit=1000&includeDeleted=true");
      if (res && res.items) {
        setPosts(res.items.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.categories?.name || "Tin tức",
          views: a.views || 0,
          status: a.status === 'published' ? 'Đã đăng' : 'Nháp',
          createdAt: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : "",
          content: a.content ? blocksToHtml(a.content) : "",
          coverImage: a.thumbnail_key || "",
          isDeleted: !!a.deleted_at
        })));
      }
    } catch (err) {
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !isAuthVerified) return;

    if (activeTab === "posts") {
      loadPosts();
      if (categories.length === 0) loadCategories();
    }
    if (activeTab === "categories") {
      loadCategories();
    }
    if (activeTab === "media") {
      loadMedia();
      loadFolders();
    }
    if (activeTab === "ads") {
      loadAds();
    }
    if (activeTab === "accounts") {
      loadAccounts();
    }
    if (activeTab === "dashboard") {
      loadDashboardStats();
    }
    // Luôn tải Site Settings khi admin đăng nhập thành công để hiển thị đúng tên website/logo ở Sidebar
    if (activeTab === "logo-footer") {
      setSettingsLoading(true);
    }
    getAdminSettings().then(res => {
      if (res) {
        cachedSettings = res;
        setSiteSettings(res as any);
        if (res.brand) {
          setLogoWebsiteName(res.brand.name || "Tên Web");
          setLogoUrl(res.brand.logo_url || null);
          setFooterOperator(res.brand.copyright || "");
          setHeaderAdsContactText(res.brand.utilityLinks?.[0]?.label || "Liên hệ quảng cáo");
          setHeaderAdsContactUrl(res.brand.utilityLinks?.[0]?.href || "");
          setHeaderZaloUrl(res.brand.socialLinks?.find((l: any) => l.platform === 'zalo')?.href || "https://zalo.me");
          setHeaderEmailUrl(res.brand.socialLinks?.find((l: any) => l.platform === 'email')?.href || "mailto:quangcao@linhka.vn");
        }
        if (res.footer) {
          setFooterAddress(res.footer.address || "");
          setFooterPhone(res.footer.phone || "");
          setFooterEmail(res.footer.email || "");
          setFooterLicense(res.footer.license || "");
          setFooterResponsible(res.footer.responsible || "");
        }
      }
    }).catch(() => {}).finally(() => {
      if (activeTab === "logo-footer") {
        setSettingsLoading(false);
      }
    });
  }, [activeTab, isLoggedIn, isAuthVerified]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "editor">("list");
  const [postCoverImage, setPostCoverImage] = useState<string | null>(null);
  const [postContent, setPostContent] = useState<string>("");

  const editorRef = useRef<HTMLDivElement>(null);

  // Keep contentEditable div synchronized with postContent state
  useEffect(() => {
    if (editorRef.current && currentView === "editor") {
      if (editorRef.current.innerHTML !== postContent) {
        editorRef.current.innerHTML = postContent;
      }
    }
  }, [currentView, postContent]);

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("all");
  const [postStartDate, setPostStartDate] = useState("");
  const [postEndDate, setPostEndDate] = useState("");
  const [hideDeletedPosts, setHideDeletedPosts] = useState(true);

  // In-Memory Database (initially populated with screenshot data)
  const [posts, setPosts] = useState<Post[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [ads, setAds] = useState<Ad[]>([]);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isAdSaving, setIsAdSaving] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [restoringPostId, setRestoringPostId] = useState<number | null>(null);
  const [deletingMediaKey, setDeletingMediaKey] = useState<string | null>(null);


  // Pagination states
  const [postsPage, setPostsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [adsPage, setAdsPage] = useState(1);
  const [mediaPage, setMediaPage] = useState(1);
  const [accountsPage, setAccountsPage] = useState(1);
  const itemsPerPage = 6;
  const mediaItemsPerPage = 9;

  // Dialog / Modal Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState<number | null>(null);
  const [targetAccountIdToDelete, setTargetAccountIdToDelete] = useState<string | null>(null);

  // Form states for Posts
  const [postForm, setPostForm] = useState<Partial<Post>>({
    title: "",
    category: "Công nghệ",
    views: 0,
    status: "Đã đăng",
    createdAt: new Date().toISOString().split("T")[0]
  });

  // Form states for Categories
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: "",
    postCount: 0,
    priority: 1,
    status: "Hoạt động"
  });

  // Form states for Ads
  const [adForm, setAdForm] = useState<Partial<Ad>>({
    name: "",
    position: "header",
    clicks: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Hoạt động",
    link: ""
  });

  // Form states for Accounts
  const [accountForm, setAccountForm] = useState<Partial<AdminAccount & { password?: string }>>({
    username: "",
    display_name: "",
    email: "",
    password: "",
    role: "admin"
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);

  // Load draft editor state on mount
  useEffect(() => {
    try {
      const savedView = localStorage.getItem("admin_editor_current_view");
      if (savedView === "editor") {
        setCurrentView("editor");
        
        const savedForm = localStorage.getItem("admin_editor_post_form");
        if (savedForm) {
          setPostForm(JSON.parse(savedForm));
        }
        
        const savedContent = localStorage.getItem("admin_editor_post_content");
        if (savedContent) {
          setPostContent(savedContent);
        }
        
        const savedCover = localStorage.getItem("admin_editor_post_cover_image");
        if (savedCover) {
          setPostCoverImage(savedCover);
        }
        
        const savedEditId = localStorage.getItem("admin_editor_edit_id");
        if (savedEditId && savedEditId !== "null" && savedEditId !== "undefined") {
          setEditId(Number(savedEditId));
        }
        
        const savedMode = localStorage.getItem("admin_editor_dialog_mode");
        if (savedMode) {
          setDialogMode(savedMode as "add" | "edit");
        }
        
        toast.info("Đã khôi phục bản nháp bài viết đang viết dở!");
      }
    } catch (e) {
      console.error("Failed to restore editor state", e);
    }
  }, []);

  // Save draft editor state on change
  useEffect(() => {
    try {
      if (currentView === "editor") {
        localStorage.setItem("admin_editor_current_view", "editor");
        localStorage.setItem("admin_editor_post_form", JSON.stringify(postForm));
        localStorage.setItem("admin_editor_post_content", postContent || "");
        if (postCoverImage) {
          localStorage.setItem("admin_editor_post_cover_image", postCoverImage);
        } else {
          localStorage.removeItem("admin_editor_post_cover_image");
        }
        localStorage.setItem("admin_editor_edit_id", editId !== null ? String(editId) : "null");
        localStorage.setItem("admin_editor_dialog_mode", dialogMode);
      } else {
        localStorage.removeItem("admin_editor_current_view");
        localStorage.removeItem("admin_editor_post_form");
        localStorage.removeItem("admin_editor_post_content");
        localStorage.removeItem("admin_editor_post_cover_image");
        localStorage.removeItem("admin_editor_edit_id");
        localStorage.removeItem("admin_editor_dialog_mode");
      }
    } catch (e) {
      console.error("Failed to save/clear editor state", e);
    }
  }, [currentView, postForm, postContent, postCoverImage, editId, dialogMode]);

  // ==========================================
  // HELPERS & DYNAMIC DATA PROCESSORS
  // ==========================================
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Filtered & Paginated items
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (hideDeletedPosts && post.isDeleted) return false;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.id.toString() === searchQuery;
      const matchesCategory = postCategoryFilter === "all" || post.category === postCategoryFilter;
      
      let matchesDates = true;
      if (postStartDate) {
        matchesDates = matchesDates && post.createdAt >= postStartDate;
      }
      if (postEndDate) {
        matchesDates = matchesDates && post.createdAt <= postEndDate;
      }
      
      return matchesSearch && matchesCategory && matchesDates;
    });
  }, [posts, searchQuery, postCategoryFilter, postStartDate, postEndDate, hideDeletedPosts]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      return cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.id.toString() === searchQuery;
    });
  }, [categories, searchQuery]);

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      return ad.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             ad.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ad.id.toString() === searchQuery;
    });
  }, [ads, searchQuery]);

  // Paginated items
  const paginatedPosts = useMemo(() => {
    const start = (postsPage - 1) * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, postsPage]);

  const paginatedCategories = useMemo(() => {
    const start = (categoriesPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, categoriesPage]);

  const paginatedAds = useMemo(() => {
    const start = (adsPage - 1) * itemsPerPage;
    return filteredAds.slice(start, start + itemsPerPage);
  }, [filteredAds, adsPage]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const query = searchQuery.toLowerCase();
      return (acc.username || "").toLowerCase().includes(query) ||
             (acc.display_name || "").toLowerCase().includes(query) ||
             (acc.email || "").toLowerCase().includes(query);
    });
  }, [accounts, searchQuery]);

  const paginatedAccounts = useMemo(() => {
    const start = (accountsPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, accountsPage]);

  // Pages count
  const postsTotalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const categoriesTotalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const adsTotalPages = Math.ceil(filteredAds.length / itemsPerPage) || 1;
  const accountsTotalPages = Math.ceil(filteredAccounts.length / itemsPerPage) || 1;

  const filteredMedia = useMemo(() => {
    const filtered = mediaItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      const matchesType = mediaTypeFilter === "all" || item.type === mediaTypeFilter;
      const matchesFolder = activeFolder ? (item.folder === activeFolder) : true;
      return matchesSearch && matchesType && matchesFolder;
    });

    return filtered.sort((a, b) => {
      if (mediaSort === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (mediaSort === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (mediaSort === "az") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [mediaItems, mediaSearchQuery, mediaTypeFilter, activeFolder, mediaSort]);

  const paginatedMedia = useMemo(() => {
    const start = (mediaPage - 1) * mediaItemsPerPage;
    return filteredMedia.slice(start, start + mediaItemsPerPage);
  }, [filteredMedia, mediaPage]);

  const mediaTotalPages = Math.ceil(filteredMedia.length / mediaItemsPerPage) || 1;

  useEffect(() => {
    setMediaPage(1);
  }, [mediaSearchQuery, mediaTypeFilter, activeFolder]);

  // Categories list options
  const categoryOptions = useMemo(() => {
    return Array.from(new Set(categories.map(c => c.name)));
  }, [categories]);

  // Dynamic Dashboard Statistics
  const dashboardStats = useMemo(() => {
    if (!dashboardData) {
      return {
        views: "0",
        viewsVal: "0",
        posts: 0,
        clicks: "0",
        viewsChange: "+0%",
        postsChange: "+0",
        clicksChange: "+0%",
        isViewsUp: true,
        isPostsUp: true,
        isClicksUp: true,
      };
    }

    const formatViews = (val: number) => {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
      if (val >= 1000) return (val / 1000).toFixed(1) + "K";
      return val.toString();
    };

    const getPercentageChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "+0%";
      const diff = ((curr - prev) / prev) * 100;
      const rounded = diff.toFixed(1);
      return diff >= 0 ? `+${rounded}%` : `${rounded}%`;
    };

    const totalArticles = dashboardData.totalArticles || 0;

    switch (timeFilter) {
      case "today": {
        const currViews = dashboardData.todayViews || 0;
        const prevViews = dashboardData.yesterdayViews || 0;
        const currClicks = dashboardData.todayClicks || 0;
        const prevClicks = dashboardData.yesterdayClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "week": {
        const currViews = dashboardData.weekViews || 0;
        const prevViews = dashboardData.prevWeekViews || 0;
        const currClicks = dashboardData.weekClicks || 0;
        const prevClicks = dashboardData.prevWeekClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "month": {
        const currViews = dashboardData.monthViews || 0;
        const prevViews = dashboardData.prevMonthViews || 0;
        const currClicks = dashboardData.monthClicks || 0;
        const prevClicks = dashboardData.prevMonthClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: getPercentageChange(currViews, prevViews),
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: getPercentageChange(currClicks, prevClicks),
          isViewsUp: currViews >= prevViews,
          isPostsUp: true,
          isClicksUp: currClicks >= prevClicks,
        };
      }
      case "year":
      default: {
        const currViews = dashboardData.totalViews || 0;
        const currClicks = dashboardData.totalClicks || 0;
        return {
          views: currViews.toLocaleString("vi-VN") + " lượt",
          viewsVal: formatViews(currViews),
          posts: totalArticles,
          clicks: currClicks.toLocaleString("vi-VN"),
          viewsChange: "+0%",
          postsChange: `Tổng: ${totalArticles}`,
          clicksChange: "+0%",
          isViewsUp: true,
          isPostsUp: true,
          isClicksUp: true,
        };
      }
    }
  }, [timeFilter, dashboardData]);

  // Dynamic Category Stats for Dashboard
  const categoryStats = useMemo(() => {
    if (!dashboardData || !dashboardData.topCategories) return [];
    const total = dashboardData.topCategories.reduce((sum: number, c: any) => sum + (c.article_count || 0), 0) || 1;
    return dashboardData.topCategories.map((cat: any) => {
      const percentage = Math.round(((cat.article_count || 0) / total) * 100);
      return {
        name: cat.name,
        count: cat.article_count || 0,
        percentage,
      };
    });
  }, [dashboardData]);

  // Dynamic top articles
  const topPosts = useMemo(() => {
    if (!dashboardData || !dashboardData.topArticles) return [];
    return dashboardData.topArticles.map((p: any) => ({
      id: p.id,
      title: p.title,
      category: p.categories?.name || "Tin tức",
      views: p.trending_views || p.views || 0,
    }));
  }, [dashboardData]);

  // Styles mapping helper
  const getCategoryStyles = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("tin tức") || lower.includes("tin")) {
      return {
        color: "from-[#ff6b6b] to-[#E55956]",
        bg: "bg-red-50 text-red-500",
        icon: FileText
      };
    }
    if (lower.includes("anime") || lower.includes("manga")) {
      return {
        color: "from-[#a78bfa] to-[#8b5cf6]",
        bg: "bg-purple-50 text-purple-500",
        icon: Folder
      };
    }
    if (lower.includes("công nghệ") || lower.includes("tech")) {
      return {
        color: "from-[#60a5fa] to-[#3b82f6]",
        bg: "bg-blue-50 text-blue-500",
        icon: TrendingUp
      };
    }
    if (lower.includes("phim")) {
      return {
        color: "from-[#f97316] to-[#ea580c]",
        bg: "bg-orange-50 text-orange-500",
        icon: ImageIcon
      };
    }
    return {
      color: "from-[#2dd4bf] to-[#0d9488]",
      bg: "bg-teal-50 text-teal-500",
      icon: Folder
    };
  };

  // Export report handler
  const handleExportReport = () => {
    if (!dashboardData) {
      toast.error("Không có dữ liệu thống kê để xuất!");
      return;
    }
    toast.loading("Đang xuất báo cáo...", { id: "export-report" });
    try {
      const csvRows = [];
      csvRows.push("Chỉ số,Hôm nay,Tuần này,Tháng này,Tổng cộng");
      
      const viewsRow = `Lượt xem bài viết,${dashboardData.todayViews || 0},${dashboardData.weekViews || 0},${dashboardData.monthViews || 0},${dashboardData.totalViews || 0}`;
      const clicksRow = `Lượt click quảng cáo,${dashboardData.todayClicks || 0},${dashboardData.weekClicks || 0},${dashboardData.monthClicks || 0},${dashboardData.totalClicks || 0}`;
      const articlesRow = `Tổng số bài viết, , , ,${dashboardData.totalArticles || 0}`;
      const adsRow = `Tổng số quảng cáo, , , ,${dashboardData.totalAds || 0}`;
      const categoriesRow = `Tổng số danh mục, , , ,${dashboardData.totalCategories || 0}`;

      csvRows.push(viewsRow);
      csvRows.push(clicksRow);
      csvRows.push(articlesRow);
      csvRows.push(adsRow);
      csvRows.push(categoriesRow);

      csvRows.push("\nDanh mục,Số lượng bài đăng");
      if (dashboardData.topCategories) {
        dashboardData.topCategories.forEach((c: any) => {
          csvRows.push(`"${c.name}",${c.article_count || 0}`);
        });
      }

      csvRows.push("\nTop Bài viết,Lượt xem,Danh mục");
      if (dashboardData.topArticles) {
        dashboardData.topArticles.forEach((p: any) => {
          csvRows.push(`"${p.title}",${p.views || 0},"${p.categories?.name || "Tin tức"}"`);
        });
      }

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `bao_cao_thong_ke_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Tải xuống báo cáo CSV thành công!", { id: "export-report" });
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xuất báo cáo!", { id: "export-report" });
    }
  };

  // ==========================================
  // ACTIONS / EVENT HANDLERS
  // ==========================================
  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setEditId(null);
    if (activeTab === "posts") {
      setPostForm({
        title: "",
        category: categoryOptions[0] || "Tin tức",
        views: 0,
        status: "Nháp",
        createdAt: new Date().toISOString().split("T")[0]
      });
      setPostContent("");
      setPostCoverImage(null);
      setCurrentView("editor");
    } else if (activeTab === "categories") {
      setCategoryForm({
        name: "",
        postCount: 0,
        priority: 0,
        status: "Hoạt động"
      });
      setCategoryDialogOpen(true);
    } else if (activeTab === "accounts") {
      setAccountForm({
        username: "",
        display_name: "",
        email: "",
        password: "",
        role: "admin"
      });
      setEditAccountId(null);
      setAccountDialogOpen(true);
    } else {
      setAdForm({
        name: "",
        position: "Header",
        clicks: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Hoạt động",
        link: ""
      });
      setAdDialogOpen(true);
    }
  };

  const handleOpenEditDialog = (item: any) => {
    setDialogMode("edit");
    setEditId(item.id);
    if (activeTab === "posts") {
      setPostForm({
        ...item
      });
      setPostContent(item.content || "");
      setPostCoverImage(item.coverImage || null);
      setCurrentView("editor");
    } else if (activeTab === "categories") {
      setCategoryForm(item);
      setCategoryDialogOpen(true);
    } else if (activeTab === "accounts") {
      setEditAccountId(item.id);
      setAccountForm({
        username: item.username,
        display_name: item.display_name,
        email: item.email || "",
        password: "",
        role: item.role
      });
      setAccountDialogOpen(true);
    } else {
      setAdForm(item);
      setAdDialogOpen(true);
    }
  };

  const executeRestore = async (id: number) => {
    try {
      setRestoringPostId(id);
      toast.loading("Đang khôi phục...", { id: "restore-post" });
      await restoreAdminArticle(id);
      toast.success("Khôi phục bài viết thành công!", { id: "restore-post" });
      loadPosts();
    } catch (err) {
      toast.error("Lỗi khi khôi phục bài viết!", { id: "restore-post" });
    } finally {
      setRestoringPostId(null);
    }
  };

  const handleConfirmDelete = (id: number) => {
    setTargetIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteAccount = (id: string) => {
    setTargetAccountIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (activeTab !== "accounts" && targetIdToDelete === null) return;
    if (activeTab === "accounts" && targetAccountIdToDelete === null) return;

    try {
      setIsDeleting(true);
      if (activeTab === "posts" && targetIdToDelete !== null) {
        await deleteAdminArticle(targetIdToDelete);
        toast.success("Xóa bài viết thành công!");
        loadPosts();
      } else if (activeTab === "categories" && targetIdToDelete !== null) {
        await deleteAdminCategory(targetIdToDelete);
        toast.success("Xóa danh mục thành công!");
        loadCategories();
      } else if (activeTab === "ads" && targetIdToDelete !== null) {
        await deleteAdminAd(targetIdToDelete);
        toast.success("Xóa quảng cáo thành công!");
        loadAds();
      } else if (activeTab === "accounts" && targetAccountIdToDelete !== null) {
        await deleteAdminAccount(targetAccountIdToDelete);
        toast.success("Xóa tài khoản thành công!");
        loadAccounts();
      }
    } catch (err) {
      toast.error("Lỗi khi xóa!");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setTargetIdToDelete(null);
      setTargetAccountIdToDelete(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "posts") {
      if (!postForm.title?.trim()) {
        toast.error("Vui lòng nhập tiêu đề bài viết!");
        return;
      }
      try {
        setIsPostSaving(true);
        toast.loading(dialogMode === "add" ? "Đang thêm bài viết..." : "Đang cập nhật...", { id: "post-submit" });
        const targetCategory = categories.find(c => c.name === postForm.category);
        const payload = {
          title: postForm.title,
          category_id: targetCategory ? targetCategory.id : undefined,
          views: Number(postForm.views) || 0,
          status: postForm.status === "Đã đăng" ? "published" : "draft",
          thumbnail_key: postCoverImage,
          content: htmlToBlocks(postContent)
        };
        
        if (dialogMode === "add") {
          await createAdminArticle(payload as any);
          toast.success("Thêm bài viết mới thành công!", { id: "post-submit" });
        } else {
          if (editId) {
            await updateAdminArticle(editId, payload as any);
            toast.success("Cập nhật bài viết thành công!", { id: "post-submit" });
          }
        }
        loadPosts();
        setCurrentView("list");
      } catch (err) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "post-submit" });
      } finally {
        setIsPostSaving(false);
      }
    } else if (activeTab === "categories") {
      if (!categoryForm.name?.trim()) {
        toast.error("Vui lòng nhập tên danh mục!");
        return;
      }
      try {
        setIsCategorySaving(true);
        toast.loading(dialogMode === "add" ? "Đang thêm danh mục..." : "Đang cập nhật...", { id: "cat-submit" });
        const payload = {
          name: categoryForm.name,
          priority: Number(categoryForm.priority) || 0,
          status: categoryForm.status === "Hoạt động" ? "active" : "inactive"
        };
        
        if (dialogMode === "add") {
          await createAdminCategory(payload as any);
          toast.success("Thêm danh mục mới thành công!", { id: "cat-submit" });
        } else {
          if (editId) {
            await updateAdminCategory(editId, payload as any);
            toast.success("Cập nhật danh mục thành công!", { id: "cat-submit" });
          }
        }
        loadCategories();
        setCategoryDialogOpen(false);
      } catch (err) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "cat-submit" });
      } finally {
        setIsCategorySaving(false);
      }
    } else if (activeTab === "accounts") {
      if (!accountForm.username?.trim()) {
        toast.error("Vui lòng nhập tên đăng nhập!");
        return;
      }
      if (!accountForm.display_name?.trim()) {
        toast.error("Vui lòng nhập tên hiển thị!");
        return;
      }
      if (!accountForm.email?.trim()) {
        toast.error("Vui lòng nhập email!");
        return;
      }
      if (dialogMode === "add" && !accountForm.password?.trim()) {
        toast.error("Vui lòng nhập mật khẩu!");
        return;
      }
      try {
        setIsAccountSaving(true);
        toast.loading(dialogMode === "add" ? "Đang thêm tài khoản..." : "Đang cập nhật...", { id: "account-submit" });
        
        if (dialogMode === "add") {
          const payload = {
            email: accountForm.email.trim(),
            password: accountForm.password?.trim(),
            username: accountForm.username.trim(),
            display_name: accountForm.display_name.trim(),
            role: accountForm.role || "admin"
          };
          await createAdminAccount(payload);
          toast.success("Thêm tài khoản mới thành công!", { id: "account-submit" });
        } else {
          if (editAccountId) {
            const payload: any = {
              email: accountForm.email.trim(),
              username: accountForm.username.trim(),
              display_name: accountForm.display_name.trim(),
              role: accountForm.role || "admin"
            };
            if (accountForm.password?.trim()) {
              payload.password = accountForm.password.trim();
            }
            await updateAdminAccount(editAccountId, payload);
            toast.success("Cập nhật tài khoản thành công!", { id: "account-submit" });
          }
        }
        loadAccounts();
        setAccountDialogOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!", { id: "account-submit" });
      } finally {
        setIsAccountSaving(false);
      }
    } else if (activeTab === "ads") {
      if (!adForm.name?.trim()) {
        toast.error("Vui lòng nhập tên quảng cáo!");
        return;
      }
      try {
        setIsAdSaving(true);
        toast.loading(dialogMode === "add" ? "Đang thêm quảng cáo..." : "Đang cập nhật...", { id: "ad-submit" });
        const payload = {
          name: adForm.name,
          position: adForm.position || "header",
          type: "image",
          media_key: adForm.image || null,
          target_url: adForm.link || null,
          starts_at: adForm.startDate ? new Date(adForm.startDate + 'T00:00:00').toISOString() : null,
          ends_at: adForm.endDate ? new Date(adForm.endDate + 'T23:59:59').toISOString() : null,
          status: adForm.status === "Ngừng hoạt động" || adForm.status === "Đã kết thúc" ? "inactive" : "active"
        };
        
        if (dialogMode === "add") {
          await createAdminAd(payload as any);
          toast.success("Thêm quảng cáo mới thành công!", { id: "ad-submit" });
        } else {
          if (editId) {
            await updateAdminAd(editId, payload as any);
            toast.success("Cập nhật quảng cáo thành công!", { id: "ad-submit" });
          }
        }
        loadAds();
        setAdDialogOpen(false);
      } catch (err) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "ad-submit" });
      } finally {
        setIsAdSaving(false);
      }
    }
    setDialogOpen(false);
  };

  const resetFilters = (showToast = true) => {
    setSearchQuery("");
    setPostCategoryFilter("all");
    setPostStartDate("");
    setPostEndDate("");
    if (showToast) {
      toast.info("Đã đặt lại bộ lọc!");
    }
  };

  // Navigations trigger tab change
  const handleTabChange = (tab: TabType) => {
    router.push(`/admin/${tab}`);
    resetFilters(false);
    setSidebarOpen(false);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    try {
      setIsPostSaving(true);
      toast.loading(dialogMode === "add" ? "Đang thêm bài viết..." : "Đang cập nhật...", { id: "post-submit" });
      const targetCategory = categories.find(c => c.name === postForm.category);
      const payload = {
        title: postForm.title,
        category_id: targetCategory ? targetCategory.id : undefined,
        views: Number(postForm.views) || 0,
        status: postForm.status === "Đã đăng" ? "published" : "draft",
        thumbnail_key: postCoverImage,
        content: htmlToBlocks(postContent)
      };
      
      if (dialogMode === "add") {
        await createAdminArticle(payload as any);
        toast.success("Thêm bài viết mới thành công!", { id: "post-submit" });
      } else {
        if (editId) {
          await updateAdminArticle(editId, payload as any);
          toast.success("Cập nhật bài viết thành công!", { id: "post-submit" });
        }
      }
      loadPosts();
      setCurrentView("list");
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: "post-submit" });
    } finally {
      setIsPostSaving(false);
    }
  };

  const handleTriggerImageUpload = () => {
    document.getElementById("cover-upload-input")?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerVideoUpload = () => {
    document.getElementById("video-upload-input")?.click();
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoFileName(file.name);
      setVideoUrl("");
    }
  };

  const handleTriggerInsertImageUpload = () => {
    document.getElementById("insert-image-upload-input")?.click();
  };

  const handleInsertImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageFileName(file.name);
      setImageUrl("");
    }
  };

  const handleInsertImage = async () => {
    if (!imageFile && !imageUrl.trim()) {
      toast.error("Vui lòng chọn file ảnh hoặc nhập link ảnh!");
      return;
    }

    let finalImageUrl = imageUrl.trim();

    if (imageFile) {
      toast.loading("Đang tải hình ảnh lên Cloudflare R2...", { id: "upload-image" });
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("folder", "articles");

        const res = await uploadAdminMedia(formData);
        if (res && res.url) {
          finalImageUrl = res.url;
          toast.success("Đã tải lên hình ảnh thành công!", { id: "upload-image" });
        } else {
          throw new Error("Không nhận được URL từ server");
        }
      } catch (err: any) {
        toast.error("Tải lên hình ảnh thất bại: " + (err.message || err), { id: "upload-image" });
        return;
      }
    }

    if (!finalImageUrl) {
      toast.error("Đường dẫn hình ảnh không hợp lệ!");
      return;
    }

    const wrapperId = "img-" + Math.random().toString(36).substring(2, 9);
    const imgHtml = `<p><br></p><div id="${wrapperId}" class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <img src="${finalImageUrl}" alt="${imageCaption}" class="w-full rounded-xl border border-gray-200 shadow-sm" />
  ${imageCaption ? `<p class="text-center text-xs italic text-gray-500 mt-1.5">${imageCaption}</p>` : ''}
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa hình ảnh">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); const img=p.querySelector('img'); if(img) { window.dispatchEvent(new CustomEvent('editor-crop-image', { detail: { src: img.src, id: p.id } })); }" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>
      Cắt ảnh
    </button>
  </div>
</div><p><br></p>`;

    insertHtmlToEditor(imgHtml);
    setImageDialogOpen(false);
    setImageUrl("");
    setImageCaption("");
    setImageFile(null);
    setImageFileName("");
  };

  const handleMediaDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsMediaUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        
        if (!isImage && !isVideo) {
          toast.error(`File "${file.name}" không hợp lệ!`);
          continue;
        }

        toast.loading(`Đang tải lên ${file.name}...`, { id: `upload-${file.name}` });
        try {
          const formData = new FormData();
          formData.append("file", file);
          if (activeFolder) formData.append("folder", activeFolder);

          await uploadAdminMedia(formData);
          toast.success(`Tải lên thành công: ${file.name}`, { id: `upload-${file.name}` });
        } catch (err: any) {
          toast.error(`Lỗi tải lên ${file.name}: ${err.message}`, { id: `upload-${file.name}` });
        }
      }
    } finally {
      setIsMediaUploading(false);
      loadMedia();
      e.target.value = "";
    }
  };

  const insertHtmlToEditor = (html: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    
    let isInsideEditor = false;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      while (node) {
        if (node === editorRef.current) {
          isInsideEditor = true;
          break;
        }
        node = node.parentNode as Node;
      }
    }
    
    if (isInsideEditor && selection) {
      try {
        document.execCommand("insertHTML", false, html);
      } catch (err) {
        editorRef.current.innerHTML += html;
      }
    } else {
      editorRef.current.innerHTML += html;
    }
    
    setPostContent(editorRef.current.innerHTML);
  };

  const handleInsertVideo = async () => {
    if (!videoFile && !videoUrl.trim()) {
      toast.error("Vui lòng chọn file video hoặc nhập link video!");
      return;
    }

    let videoHtml = "";
    if (videoFile) {
      toast.loading("Đang tải video lên Cloudflare R2...", { id: "upload-video" });
      try {
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("folder", "articles");

        const res = await uploadAdminMedia(formData);
        if (res && res.url) {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <video controls src="${res.url}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
</div><p><br></p>`;
          toast.success("Đã tải lên và chèn video thành công!", { id: "upload-video" });
        } else {
          throw new Error("Không nhận được URL từ server");
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        toast.error("Tải lên video thất bại: " + e.message, { id: "upload-video" });
        return;
      }
    } else if (videoUrl.trim()) {
      const url = videoUrl.trim();
      if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
        let videoId = "";
        try {
          if (url.includes("youtube.com/watch")) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get("v") || "";
          } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
          }
        } catch (err) {
          console.error("Invalid URL", err);
        }

        if (videoId) {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <iframe class="w-full aspect-video rounded-xl shadow-sm border border-gray-200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video nhúng">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div><p><br></p>`;
        } else {
          videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <iframe class="w-full aspect-video rounded-xl shadow-sm border border-gray-200" src="${url}" frameborder="0" allowfullscreen></iframe>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video nhúng">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div><p><br></p>`;
        }
      } else {
        videoHtml = `<p><br></p><div class="my-4 relative group" contenteditable="false" style="max-width: 100%; margin: 0 auto;">
  <video controls src="${url}" class="w-full max-h-[400px] rounded-xl border border-gray-200 shadow-sm"></video>
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa video">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 whitespace-nowrap w-max min-w-max">
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='25%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">25%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='50%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">50%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='75%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">75%</button>
    <span class="w-[1px] h-3 bg-white/20"></span>
    <button type="button" onclick="const p=this.closest('[contenteditable=false]'); p.style.maxWidth='100%'; const ed=p.closest('[contenteditable]'); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="hover:text-[#E55956] transition-colors px-1.5 py-0.5">100%</button>
  </div>
</div><p><br></p>`;
      }
      toast.success("Đã chèn video thành công!");
    }

    insertHtmlToEditor(videoHtml);
    setVideoDialogOpen(false);
    setVideoFile(null);
    setVideoFileName("");
    setVideoUrl("");
  };

  // Đang xác thực session, hiển thị spinner để tránh flicker màn hình đăng nhập
  if (!isAuthVerified) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 font-sans antialiased text-[#2c3e50] select-none">
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email quản trị</label>
              <input
                type="email"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Nhập địa chỉ email..."
                autoComplete="email"
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
                  autoComplete="current-password"
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

  if (currentView === "editor") {
    return (
      <div className="min-h-screen bg-[#fafbfc] text-[#2c3e50] font-sans antialiased flex flex-col animate-fade-in">
        
        {/* Top Header */}
        <header className="h-[65px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setCurrentView("list");
              setPostCoverImage(null);
            }}
            className="flex items-center gap-2 text-gray-800 hover:text-gray-950 font-bold text-sm transition-all"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>

          <button
            type="button"
            onClick={handleSavePost}
            disabled={isPostSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isPostSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Lưu bài viết</span>
          </button>
        </header>

        {/* Editor Body */}
        <main className="max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Main Editor) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Title */}
            <div className="space-y-1.5 flex-shrink-0">
              <label className="text-sm font-bold text-gray-700">Tiêu đề bài viết</label>
              <input
                type="text"
                value={postForm.title || ""}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                placeholder="Nhập tiêu đề..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            {/* Rich Text Toolbar */}
            <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm text-gray-600 flex-shrink-0">
              
              {/* Font Family Dropdown */}
              <div className="relative">
                <select className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700">
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Font Size Dropdown */}
              <div className="relative">
                <select className="bg-transparent hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer appearance-none pr-6 border-none text-gray-700">
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Formatting buttons */}
              <button
                type="button"
                onClick={() => document.execCommand("bold")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Bold"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("italic")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Italic"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("underline")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Underline"
              >
                <Underline size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Alignment */}
              <button
                type="button"
                onClick={() => document.execCommand("justifyLeft")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyCenter")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyRight")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyFull")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Align Justify"
              >
                <AlignJustify size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => document.execCommand("insertUnorderedList")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Bullet List"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("insertOrderedList")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </button>

              <div className="h-4 w-px bg-gray-200 mx-1" />

              {/* Media */}
              <button
                type="button"
                onClick={() => {
                  setImageDialogOpen(true);
                  loadMedia();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Insert Image"
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoDialogOpen(true);
                  loadMedia();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hover:text-gray-900"
                title="Insert Video"
              >
                <Video size={15} />
              </button>

            </div>

            {/* Editor ContentEditable Div */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col min-h-[450px] overflow-y-auto">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setPostContent(e.currentTarget.innerHTML)}
                className="w-full flex-1 outline-none text-sm leading-relaxed text-gray-800 bg-transparent border-none min-h-[400px]"
              />
            </div>

          </div>

          {/* Right Column (Settings) */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-[85px]">
            
            {/* Card: Thông tin bài viết */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5">
                Thông tin bài viết
              </h3>

              <div className="space-y-3.5">
                
                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Danh mục</label>
                  <div className="relative">
                    <select
                      value={postForm.category || ""}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50 appearance-none font-semibold text-gray-800"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái</label>
                  <div className="relative">
                    <select
                      value={postForm.status || "Nháp"}
                      onChange={(e) => setPostForm({ ...postForm, status: e.target.value as "Đã đăng" | "Nháp" })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50 appearance-none font-semibold text-gray-800"
                    >
                      <option value="Đã đăng">Đã đăng</option>
                      <option value="Nháp">Nháp</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            {/* Card: Ảnh bìa */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5 flex-shrink-0">
                Ảnh bìa
              </h3>

              {postCoverImage ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[16/10] w-full flex-shrink-0">
                  <img src={postCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setPostCoverImage(null)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleTriggerImageUpload}
                  className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer aspect-[16/10] w-full flex-shrink-0 group"
                >
                  <Upload size={24} className="text-gray-400 group-hover:text-[#E55956] transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-[#E55956] transition-colors">Tải ảnh bìa lên</span>
                  <input
                    type="file"
                    id="cover-upload-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

          </div>

        </main>

        {/* ==========================================
            MODAL: INSERT IMAGE POPUP
            ========================================== */}
        <Dialog open={imageDialogOpen} onOpenChange={(open) => {
          setImageDialogOpen(open);
          if (!open) {
            setImageUrl("");
            setImageCaption("");
            setImageFile(null);
            setImageFileName("");
          }
        }}>
          <DialogContent className="max-w-[640px] w-[95%] max-h-[90vh] overflow-y-auto rounded-3xl p-7 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
            <DialogHeader className="flex flex-row items-center gap-2 border-b border-gray-100 pb-4 pr-6">
              <div className="w-8 h-8 rounded-lg bg-[#E55956]/10 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="text-[#E55956] w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900 leading-none">
                Chèn Hình Ảnh
              </DialogTitle>
            </DialogHeader>

            {/* Tab Selector */}
            <div className="flex gap-2 border-b border-gray-100 py-2">
              <button
                type="button"
                onClick={() => setImageTab("link")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  imageTab === "link"
                    ? "bg-[#E55956] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Dán liên kết (URL)
              </button>
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  imageTab === "upload"
                    ? "bg-[#E55956] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tải lên từ máy tính
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageTab("library");
                  loadMedia();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  imageTab === "library"
                    ? "bg-[#E55956] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Thư viện Media (R2)
              </button>
            </div>

            <div className="space-y-4 py-4 min-h-[250px]">
              {imageTab === "link" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Đường dẫn hình ảnh (URL)
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Chú thích ảnh (Caption)
                    </label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Ví dụ: Quang cảnh buổi họp báo..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                    />
                  </div>
                </div>
              ) : imageTab === "upload" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Từ máy tính
                    </label>
                    <div
                      onClick={handleTriggerInsertImageUpload}
                      className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all duration-300 rounded-2xl p-7 flex flex-col items-center justify-center gap-3 cursor-pointer group bg-gray-50/20"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#E55956]/10 flex items-center justify-center transition-all duration-300">
                        <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-[#E55956] transition-colors" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 group-hover:text-[#E55956] transition-colors text-center max-w-[280px]">
                        {imageFileName ? imageFileName : "Chọn file ảnh (PNG, JPG, JPEG, WEBP, ...)"}
                      </span>
                      <input
                        type="file"
                        id="insert-image-upload-input"
                        className="hidden"
                        accept="image/*"
                        onChange={handleInsertImageFileChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Chú thích ảnh (Caption)
                    </label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Ví dụ: Quang cảnh buổi họp báo..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Media Grid */}
                  {mediaLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 animate-pulse">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-gray-150" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                      {mediaItems.filter((item) => item.type === "image").map((item) => {
                        const fullUrl = item.url.startsWith("blob:") || item.url.startsWith("data:") || item.url.startsWith("http") ? item.url : (window.location.origin + item.url);
                        const isSelected = imageUrl === fullUrl;
                        return (
                          <div
                            key={item.key}
                            onClick={() => {
                              setImageUrl(fullUrl);
                              if (!imageCaption) setImageCaption(item.title);
                            }}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                              isSelected ? "border-[#E55956] ring-2 ring-[#E55956]/15" : "border-transparent bg-slate-50 hover:bg-slate-100"
                            }`}
                          >
                            <img
                              src={fullUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 truncate text-[10px] text-white font-medium text-center">
                              {item.title}
                            </div>
                          </div>
                        );
                      })}
                      {mediaItems.filter((item) => item.type === "image").length === 0 && (
                        <div className="col-span-full py-10 text-center text-xs text-gray-400 font-semibold">
                          Không tìm thấy hình ảnh nào trong thư mục này
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Chú thích ảnh (Caption)
                    </label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Ví dụ: Quang cảnh buổi họp báo..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => {
                  setImageDialogOpen(false);
                  setImageUrl("");
                  setImageCaption("");
                  setImageFile(null);
                  setImageFileName("");
                }}
                className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="flex-1 max-w-[144px] py-3 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
              >
                Chèn ảnh
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ==========================================
            MODAL: INSERT VIDEO POPUP (IMPROVED)
            ========================================== */}
        <Dialog open={videoDialogOpen} onOpenChange={(open) => {
          setVideoDialogOpen(open);
          if (!open) {
            setVideoFile(null);
            setVideoFileName("");
            setVideoUrl("");
          }
        }}>
          <DialogContent className="max-w-[640px] w-[95%] max-h-[90vh] overflow-y-auto rounded-3xl p-7 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
            <DialogHeader className="flex flex-row items-center gap-2 border-b border-gray-100 pb-4 pr-6">
              <div className="w-8 h-8 rounded-lg bg-[#E55956]/10 flex items-center justify-center flex-shrink-0">
                <Video className="text-[#E55956] w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900 leading-none">
                Chèn Video
              </DialogTitle>
            </DialogHeader>

            {/* Tab Selector */}
            <div className="flex gap-2 border-b border-gray-100 py-2">
              <button
                type="button"
                onClick={() => setVideoTab("link")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  videoTab === "link"
                    ? "bg-[#E55956] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Dán liên kết (YouTube / URL)
              </button>
              <button
                type="button"
                onClick={() => setVideoTab("upload")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  videoTab === "upload"
                    ? "bg-[#E55956] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tải lên từ máy tính
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoTab("library");
                  loadMedia();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  videoTab === "library"
                    ? "bg-[#E55956] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Thư viện Media (R2)
              </button>
            </div>

            <div className="space-y-4 py-4 min-h-[250px]">
              {videoTab === "link" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Link Youtube / URL Video
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setVideoFile(null);
                      setVideoFileName("");
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                  />
                </div>
              ) : videoTab === "upload" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Từ máy tính
                  </label>
                  <div
                    onClick={handleTriggerVideoUpload}
                    className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all duration-300 rounded-2xl p-7 flex flex-col items-center justify-center gap-3 cursor-pointer group bg-gray-50/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#E55956]/10 flex items-center justify-center transition-all duration-300">
                      <Video className="w-5 h-5 text-gray-400 group-hover:text-[#E55956] transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-[#E55956] transition-colors text-center max-w-[280px]">
                      {videoFileName ? videoFileName : "Chọn file video (MP4, MOV, AVI, ...)"}
                    </span>
                    <input
                      type="file"
                      id="video-upload-input"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Videos Grid */}
                  {mediaLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 animate-pulse">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-gray-150 flex flex-col items-center justify-center p-2" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                      {mediaItems.filter((item) => item.type === "video" || item.key.match(/\.(mp4|webm|ogg)$/i)).map((item) => {
                        const fullUrl = item.url.startsWith("blob:") || item.url.startsWith("data:") || item.url.startsWith("http") ? item.url : (window.location.origin + item.url);
                        const isSelected = videoUrl === fullUrl;
                        return (
                          <div
                            key={item.key}
                            onClick={() => {
                              setVideoUrl(fullUrl);
                              setVideoFile(null);
                              setVideoFileName("");
                            }}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-slate-50 flex flex-col items-center justify-center p-2 text-center gap-2 group ${
                              isSelected ? "border-[#E55956] ring-2 ring-[#E55956]/15" : "border-transparent hover:bg-slate-100"
                            }`}
                          >
                            <Video className="w-8 h-8 text-gray-400 group-hover:text-[#E55956] transition-colors" />
                            <span className="text-[10px] text-gray-600 font-bold truncate w-full">
                              {item.title}
                            </span>
                          </div>
                        );
                      })}
                      {mediaItems.filter((item) => item.type === "video" || item.key.match(/\.(mp4|webm|ogg)$/i)).length === 0 && (
                        <div className="col-span-full py-10 text-center text-xs text-gray-400 font-semibold">
                          Không tìm thấy video nào trong thư mục này
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => {
                  setVideoDialogOpen(false);
                  setVideoFile(null);
                  setVideoFileName("");
                  setVideoUrl("");
                }}
                className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                className="flex-1 max-w-[144px] py-3 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
              >
                Chèn Video
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ==========================================
            MODAL: CROP IMAGE POPUP
            ========================================== */}
        <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
          <DialogContent className="max-w-[540px] w-[95%] max-h-[95vh] overflow-y-auto rounded-3xl p-7 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
            <DialogHeader className="flex flex-row items-center gap-2 border-b border-gray-100 pb-4 pr-6">
              <div className="w-8 h-8 rounded-lg bg-[#E55956]/10 flex items-center justify-center flex-shrink-0">
                <Crop className="text-[#E55956] w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900 leading-none">
                Cắt cúp hình ảnh (Crop)
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Preview Box */}
              <div className="relative overflow-hidden max-w-full max-h-[350px] border border-gray-200 rounded-2xl bg-slate-50 flex items-center justify-center p-4 select-none">
                <div 
                  ref={cropContainerRef} 
                  className="relative max-w-full max-h-[300px] select-none"
                >
                  <img 
                    src={cropImageUrl} 
                    alt="Source image to crop" 
                    className="max-w-full max-h-[300px] object-contain select-none pointer-events-none" 
                    draggable={false}
                  />
                  {/* Draggable & Resizable crop selection overlay */}
                  <div 
                    className="absolute border-2 border-dashed border-[#E55956] bg-black/25 cursor-move z-30 group"
                    style={{
                      left: `${cropArea.x}%`,
                      top: `${cropArea.y}%`,
                      width: `${cropArea.width}%`,
                      height: `${cropArea.height}%`,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragState({
                        type: 'drag',
                        startX: e.clientX,
                        startY: e.clientY,
                        startArea: { ...cropArea }
                      });
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setDragState({
                        type: 'drag',
                        startX: e.touches[0].clientX,
                        startY: e.touches[0].clientY,
                        startArea: { ...cropArea }
                      });
                    }}
                  >
                    {/* Visual Guideline Grid */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                      <div className="border-r border-b border-dashed border-white/50"></div>
                      <div className="border-r border-b border-dashed border-white/50"></div>
                      <div className="border-b border-dashed border-white/50"></div>
                      <div className="border-r border-b border-dashed border-white/50"></div>
                      <div className="border-r border-b border-dashed border-white/50"></div>
                      <div className="border-b border-dashed border-white/50"></div>
                      <div className="border-r border-white/50"></div>
                      <div className="border-r border-white/50"></div>
                      <div></div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-black/75 px-2 py-0.5 rounded text-[9px] text-white font-bold select-none">
                        Vùng cắt
                      </span>
                    </div>

                    {/* Drag resize handles (Corners) */}
                    {/* NW (Top-Left) */}
                    <div 
                      className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E55956] rounded-full cursor-nwse-resize z-40 shadow-sm active:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'nw',
                          startX: e.clientX,
                          startY: e.clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'nw',
                          startX: e.touches[0].clientX,
                          startY: e.touches[0].clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                    />
                    {/* NE (Top-Right) */}
                    <div 
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E55956] rounded-full cursor-nesw-resize z-40 shadow-sm active:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'ne',
                          startX: e.clientX,
                          startY: e.clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'ne',
                          startX: e.touches[0].clientX,
                          startY: e.touches[0].clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                    />
                    {/* SW (Bottom-Left) */}
                    <div 
                      className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E55956] rounded-full cursor-nesw-resize z-40 shadow-sm active:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'sw',
                          startX: e.clientX,
                          startY: e.clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'sw',
                          startX: e.touches[0].clientX,
                          startY: e.touches[0].clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                    />
                    {/* SE (Bottom-Right) */}
                    <div 
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E55956] rounded-full cursor-nwse-resize z-40 shadow-sm active:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'se',
                          startX: e.clientX,
                          startY: e.clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDragState({
                          type: 'resize',
                          handle: 'se',
                          startX: e.touches[0].clientX,
                          startY: e.touches[0].clientY,
                          startArea: { ...cropArea }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Position and Size Sliders */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <span>Vị trí ngang (X): {cropArea.x}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={100 - cropArea.width} 
                    value={cropArea.x} 
                    onChange={(e) => setCropArea(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <span>Vị trí dọc (Y): {cropArea.y}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={100 - cropArea.height} 
                    value={cropArea.y} 
                    onChange={(e) => setCropArea(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <span>Chiều rộng (Width): {cropArea.width}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max={100 - cropArea.x} 
                    value={cropArea.width} 
                    onChange={(e) => setCropArea(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <span>Chiều cao (Height): {cropArea.height}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max={100 - cropArea.y} 
                    value={cropArea.height} 
                    onChange={(e) => setCropArea(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E55956]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => setCropDialogOpen(false)}
                className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.src = cropImageUrl;
                  img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    
                    const pixelX = (cropArea.x / 100) * img.naturalWidth;
                    const pixelY = (cropArea.y / 100) * img.naturalHeight;
                    const pixelW = (cropArea.width / 100) * img.naturalWidth;
                    const pixelH = (cropArea.height / 100) * img.naturalHeight;
                    
                    canvas.width = pixelW;
                    canvas.height = pixelH;
                    
                    ctx.drawImage(
                      img,
                      pixelX, pixelY, pixelW, pixelH,
                      0, 0, pixelW, pixelH
                    );
                    
                    canvas.toBlob(async (blob) => {
                      if (!blob) return;
                      const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
                      
                      toast.loading("Đang tải ảnh đã cắt lên R2...", { id: "upload-cropped" });
                      try {
                        const formData = new FormData();
                        formData.append("file", croppedFile);
                        formData.append("folder", "articles");
                        const res = await uploadAdminMedia(formData);
                        if (res && res.url) {
                          const wrapper = document.getElementById(cropImageElementId);
                          if (wrapper) {
                            const imgEl = wrapper.querySelector("img");
                            if (imgEl) {
                              imgEl.src = res.url;
                              const ed = wrapper.closest("[contenteditable]");
                              if (ed) ed.dispatchEvent(new Event("input", { bubbles: true }));
                            }
                          }
                          toast.success("Đã cắt cúp và chèn ảnh thành công!", { id: "upload-cropped" });
                          setCropDialogOpen(false);
                        }
                      } catch (err) {
                        const e = err instanceof Error ? err : new Error(String(err));
                        toast.error("Lỗi tải ảnh cắt: " + e.message, { id: "upload-cropped" });
                      }
                    }, "image/jpeg", 0.9);
                  };
                }}
                className="flex-1 max-w-[144px] py-3 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
              >
                Cắt cúp & Lưu
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex font-sans antialiased text-[#2c3e50]">

      {/* ==========================================
          SIDEBAR PANEL
          ========================================== */}
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-[#E55956] text-white p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:flex`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3.5 mb-10 mt-2">
            <div className="w-[50px] h-[50px] bg-[#d9d9d9] rounded-full flex-shrink-0 border-2 border-white/25 shadow-sm" />
            <span className="font-extrabold text-[22px] tracking-tight drop-shadow-sm">{logoWebsiteName || "Logo"}</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-white hover:text-red-100 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "dashboard"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <LayoutDashboard size={18} className="flex-shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleTabChange("posts")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "posts"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileText size={18} className="flex-shrink-0" />
              <span>Quản lý bài viết</span>
            </button>

            <button
              onClick={() => handleTabChange("categories")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "categories"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Folder size={18} className="flex-shrink-0" />
              <span>Quản lý danh mục</span>
            </button>

            <button
              onClick={() => handleTabChange("ads")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "ads"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 16V8h2a3 3 0 0 1 0 6H7" />
                <path d="M14 16v-6a2 2 0 0 1 4 0v6" />
                <path d="M14 13h4" />
              </svg>
              <span>Quản lý AD</span>
            </button>

            <button
              onClick={() => handleTabChange("logo-footer")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "logo-footer"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
              </svg>
              <span>Logo & Footer</span>
            </button>

            <button
              onClick={() => handleTabChange("media")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "media"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <ImageIcon size={18} className="flex-shrink-0" />
              <span>Quản lý Media</span>
            </button>

            <button
              onClick={() => handleTabChange("accounts")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === "accounts"
                  ? "bg-[#cb4643] text-white shadow-md border-l-4 border-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Lock size={18} className="flex-shrink-0" />
              <span>Quản lý Tài khoản</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Link */}
        <div className="pt-4 border-t border-white/20 text-xs text-white/60 text-center">
          Admin Control Center &copy; 2026
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* TOP NAVBAR (for mobile toggling and general status) */}
        <header className="h-[70px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#2c3e50] hover:text-[#cb4643] transition-colors p-1.5 border border-gray-200 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard size={20} className="text-[#E55956]" />
              <span>
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "posts" && "Quản lý bài viết"}
                {activeTab === "categories" && "Quản lý danh mục"}
                {activeTab === "ads" && "Quản lý AD"}
                {activeTab === "logo-footer" && "Logo & Footer"}
                {activeTab === "media" && "Quản lý Media"}
                {activeTab === "accounts" && "Quản lý Tài khoản"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">Administrator</span>
                <span className="text-[10px] font-semibold text-[#E55956] uppercase tracking-wider">Super Admin</span>
              </div>
              <div className="w-[40px] h-[40px] rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300 select-none">
                AD
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-[#E55956] transition-all"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "dashboard" ? (
            dashboardLoading ? (
              <DashboardSkeleton />
            ) : (
            <>
              {/* HEADER ACTION BANNER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2.5 h-full bg-[#E55956]" />
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Dashboard</h2>
                  <p className="text-xs text-gray-500 mt-1">Tổng quan hoạt động và hiệu suất toàn bộ hệ thống</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportReport}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
                >
                  <Download size={16} />
                  <span>Xuất thống kê</span>
                </button>
              </div>

              {/* FILTER BAR SECTION */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                  {[
                    { id: "today", label: "Hôm nay" },
                    { id: "week", label: "Tuần này" },
                    { id: "month", label: "Tháng này" },
                    { id: "year", label: "Năm nay" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTimeFilter(item.id as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                        timeFilter === item.id
                          ? "bg-[#E55956] text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Select Ngày */}
                  <div className="relative">
                    <select
                      value={dashboardDay}
                      onChange={(e) => setDashboardDay(e.target.value)}
                      className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[75px]"
                    >
                      <option value="">Ngày</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Select Tháng */}
                  <div className="relative">
                    <select
                      value={dashboardMonth}
                      onChange={(e) => setDashboardMonth(e.target.value)}
                      className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[90px]"
                    >
                      <option value="">Tháng</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Select Năm */}
                  <div className="relative">
                    <select
                      value={dashboardYear}
                      onChange={(e) => setDashboardYear(e.target.value)}
                      className="pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white text-gray-700 appearance-none cursor-pointer min-w-[85px]"
                    >
                      <option value="">Năm</option>
                      {Array.from({ length: 151 }, (_, i) => {
                        const year = new Date().getFullYear() + 50 - i;
                        return (
                          <option key={year} value={String(year)}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (dashboardDay || dashboardMonth || dashboardYear) {
                        const parts = [];
                        if (dashboardDay) parts.push(dashboardDay);
                        if (dashboardMonth) parts.push(dashboardMonth);
                        if (dashboardYear) parts.push(dashboardYear);
                        toast.success(`Đã áp dụng bộ lọc ngày: ${parts.join("/")}`);
                      } else {
                        toast.info("Vui lòng chọn ngày, tháng hoặc năm để lọc!");
                      }
                    }}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center h-[38px]"
                  >
                    Lọc
                  </button>
                </div>
              </div>

              {/* METRICS CARDS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng lượt xem</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center transition-colors group-hover:bg-blue-500 group-hover:text-white">
                      <Eye size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {dashboardStats.viewsVal}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp size={12} />
                      {dashboardStats.viewsChange}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Lượt xem trang thực tế trong chu kỳ</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bài viết</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center transition-colors group-hover:bg-purple-500 group-hover:text-white">
                      <FileText size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {dashboardStats.posts}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp size={12} />
                      {dashboardStats.postsChange}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Bài đăng và bản nháp hoạt động</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clicks QC</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center transition-colors group-hover:bg-orange-500 group-hover:text-white">
                      <MousePointerClick size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {dashboardStats.clicks}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp size={12} />
                      {dashboardStats.clicksChange}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Lượt click vào banner QC hiển thị</p>
                </div>
              </div>

              {/* CATEGORIES PROGRESS SECTION */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="border-b border-gray-100 pb-4 mb-5">
                  <h3 className="text-base font-extrabold text-gray-900">Phân bố danh mục</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Phân chia tỉ lệ phần trăm số lượng bài viết hệ thống</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryStats.map((item: { name: string; count: number; percentage: number }) => {
                    const style = getCategoryStyles(item.name);
                    const IconComponent = style.icon;
                    return (
                      <div
                        key={item.name}
                        className="p-4.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-xs flex flex-col justify-between group bg-slate-50/25"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center`}>
                              <IconComponent size={15} />
                            </div>
                            <span className="text-xs font-bold text-gray-800">{item.name}</span>
                          </div>
                          <span className="text-xs font-extrabold text-gray-900">{item.percentage}%</span>
                        </div>

                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${style.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>

                        <span className="text-[11px] text-gray-400 font-bold self-end">
                          {item.count} bài viết
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Bài viết nổi bật */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900">Bài viết nổi bật</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Top 5 bài viết được xem nhiều nhất trong 7 ngày qua</p>
                      </div>
                      <span className="text-xs font-bold text-[#E55956] bg-red-50 px-2.5 py-1 rounded-lg">Xu hướng</span>
                    </div>

                    <div className="space-y-3">
                      {topPosts.map((post: { title: string; views: number; category: string; id?: number }, index: number) => {
                        const badgeColors = [
                          "bg-gradient-to-br from-red-500 to-[#E55956] text-white shadow-sm",
                          "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm",
                          "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm",
                          "bg-slate-100 text-slate-600",
                          "bg-slate-100 text-slate-600"
                        ];

                        return (
                          <div
                            key={post.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-transparent group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${badgeColors[index] || "bg-gray-100 text-gray-600"}`}>
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-[#E55956] transition-colors leading-snug">
                                  {post.title}
                                </h4>
                                <span className="inline-block text-[10px] text-gray-400 font-semibold mt-1 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                                  {post.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right ml-4 flex-shrink-0 flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-gray-900">
                                {post.views.toLocaleString("vi-VN")}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">views</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Hoạt động gần đây */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900">Hoạt động gần đây</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Cập nhật hoạt động mới nhất từ hệ thống</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="relative pl-6 border-l-2 border-dashed border-gray-100 space-y-5.5 py-2">
                      {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                        dashboardData.recentActivities.map((act: any, idx: number) => {
                          const timeStr = (() => {
                            const diffMs = new Date().getTime() - new Date(act.createdAt).getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMins / 60);
                            if (diffMins < 1) return "Vừa xong";
                            if (diffMins < 60) return `${diffMins} phút trước`;
                            if (diffHours < 24) return `${diffHours} giờ trước`;
                            return new Date(act.createdAt).toLocaleDateString("vi-VN");
                          })();

                          const typeLabel = act.type === 'article' ? 'Bài viết mới' : act.type === 'ad' ? 'Quảng cáo mới' : 'Danh mục mới';
                          const typeColor = act.type === 'article' ? '#E55956' : act.type === 'ad' ? 'orange' : 'purple';
                          const typeBg = act.type === 'article' ? 'bg-[#E55956]' : act.type === 'ad' ? 'bg-orange-500' : 'bg-purple-500';

                          return (
                            <div key={idx} className="relative group">
                              <div className={`absolute -left-[31px] top-0.5 w-[11px] h-[11px] rounded-full ${typeBg} border-2 border-white group-hover:scale-125 transition-transform`} />
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: typeColor }}>
                                  {typeLabel}
                                </span>
                                <h4 className="text-xs font-bold text-gray-800 mt-0.5 truncate max-w-[280px]" title={act.title}>
                                  {act.title}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-bold block mt-1">
                                  {timeStr} {act.status ? `• Trạng thái: ${act.status}` : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-450 italic py-4">Chưa có hoạt động nào vừa diễn ra</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
            )
          ) : activeTab === "logo-footer" ? (
            settingsLoading ? (
              <LogoFooterSkeleton />
            ) : (
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
                    onClick={async () => {
                      try {
                        setIsSettingsSaving(true);
                        toast.loading("Đang lưu cấu hình...", { id: "save-logo-footer" });
                        const updatedPayload = {
                          brand: {
                            name: logoWebsiteName,
                            logo_url: logoUrl,
                            copyright: footerOperator,
                            utilityLinks: [
                              {
                                label: headerAdsContactText,
                                href: headerAdsContactUrl || ""
                              }
                            ],
                            socialLinks: [
                              {
                                label: "Zalo",
                                href: headerZaloUrl || "https://zalo.me",
                                platform: "zalo"
                              },
                              {
                                label: "Email",
                                href: headerEmailUrl || "mailto:quangcao@linhka.vn",
                                platform: "email"
                              }
                            ]
                          },
                          footer: {
                            address: footerAddress,
                            phone: footerPhone,
                            email: footerEmail,
                            license: footerLicense,
                            responsible: footerResponsible
                          }
                        };
                        await updateAdminSettings(updatedPayload);
                        cachedSettings = updatedPayload; // Cập nhật cache tức thời
                        toast.success("Lưu thay đổi thành công!", { id: "save-logo-footer" });
                      } catch (err) {
                        toast.error("Lỗi khi lưu cấu hình!", { id: "save-logo-footer" });
                      } finally {
                        setIsSettingsSaving(false);
                      }
                    }}
                    disabled={isSettingsSaving}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E55956] hover:bg-[#cb4643] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSettingsSaving ? (
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setLogoUrl(reader.result as string);
                            toast.success("Đã chọn ảnh logo mới!");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("logo-upload-input")?.click()}
                      className="text-[#E55956] hover:text-[#cb4643] text-xs font-bold transition-colors mt-2 cursor-pointer"
                    >
                      Đổi logo
                    </button>
                  </div>

                  {/* Logo name input */}
                  <div className="w-full sm:flex-1 space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Tên website
                    </label>
                    <input
                      type="text"
                      value={logoWebsiteName}
                      onChange={(e) => setLogoWebsiteName(e.target.value)}
                      placeholder="Nhập tên website..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2.5: Cấu hình Liên hệ & Mạng xã hội Header */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Cấu hình Liên hệ & Mạng xã hội Header
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Chữ hiển thị Liên hệ quảng cáo
                    </label>
                    <input
                      type="text"
                      value={headerAdsContactText}
                      onChange={(e) => setHeaderAdsContactText(e.target.value)}
                      placeholder="VD: Liên hệ quảng cáo"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Link Liên hệ quảng cáo
                    </label>
                    <input
                      type="text"
                      value={headerAdsContactUrl}
                      onChange={(e) => setHeaderAdsContactUrl(e.target.value)}
                      placeholder="VD: https://zalo.me/... hoặc để trống"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-600">
                      Link Zalo (Header)
                    </label>
                    <input
                      type="text"
                      value={headerZaloUrl}
                      onChange={(e) => setHeaderZaloUrl(e.target.value)}
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
                      onChange={(e) => setHeaderEmailUrl(e.target.value)}
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
                      onChange={(e) => setFooterOperator(e.target.value)}
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
                      onChange={(e) => setFooterAddress(e.target.value)}
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
                      onChange={(e) => setFooterResponsible(e.target.value)}
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
                      onChange={(e) => setFooterPhone(e.target.value)}
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
                      onChange={(e) => setFooterEmail(e.target.value)}
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
                      onChange={(e) => setFooterLicense(e.target.value)}
                      placeholder="Nhập số giấy phép..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>
            )
          ) : activeTab === "media" ? (
            <div className="space-y-5 animate-fade-in">
              {/* Header Panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Thư viện Media</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Ảnh & video lưu trữ trên Cloudflare R2</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("media-direct-upload")?.click();
                  }}
                  disabled={isMediaUploading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#eb5757] hover:bg-[#d94848] text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-center disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isMediaUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>{isMediaUploading ? "Đang tải lên..." : "Thêm media"}</span>
                </button>
                <input
                  type="file"
                  id="media-direct-upload"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaDirectUpload}
                />
              </div>

              {/* Filter & Search Bar Panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Filter by Types */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lọc</span>
                  <div className="flex gap-2">
                    {[
                      { id: "all", label: "Tất cả" },
                      { id: "image", label: "Ảnh" },
                      { id: "video", label: "Video" }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setMediaTypeFilter(type.id as any)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                          mediaTypeFilter === type.id
                            ? "bg-[#eb5757] text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-1.5 w-full md:w-[350px]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tìm kiếm thông tin</span>
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold" />
                    <input
                      type="text"
                      value={mediaSearchQuery}
                      onChange={(e) => setMediaSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm"
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs outline-none focus:border-[#eb5757] focus:ring-1 focus:ring-[#eb5757]/15 transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Split Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Cây thư mục */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-150 bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-800">Cây thư mục</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setNewFolderName("");
                        setFolderDialogOpen(true);
                      }}
                      className="p-1 border border-gray-300 hover:border-gray-400 rounded transition-colors hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Plus size={12} className="text-gray-700 font-bold" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    {/* Root Folder Item */}
                    <div 
                      onClick={() => setActiveFolder("")}
                      className={`flex items-center gap-1.5 cursor-pointer font-bold text-xs transition-all ${
                        !activeFolder ? "text-[#eb5757]" : "text-gray-800 hover:text-gray-900"
                      }`}
                    >
                      <ChevronDown size={14} className={!activeFolder ? "text-[#eb5757]" : "text-gray-500"} />
                      <span>Root</span>
                    </div>

                    {/* Subdirectories */}
                    <div className="pl-4 mt-1.5 space-y-1 border-l border-gray-100 ml-1.5">
                      {folders.map((folderName) => {
                        const isActive = activeFolder === folderName;
                        return (
                          <div
                            key={folderName}
                            className={`group/folder flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              isActive
                                ? "bg-[#ffe4e4] text-[#eb5757]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <div 
                              onClick={() => setActiveFolder(folderName)}
                              className="flex items-center gap-1.5 flex-1"
                            >
                              <ChevronRight size={12} className={isActive ? "text-[#eb5757]" : "text-gray-400"} />
                              <span>{folderName}</span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Bạn có chắc chắn muốn xóa thư mục "${folderName}" khỏi danh sách hiển thị?`)) {
                                  setFolders(prev => prev.filter(f => f !== folderName));
                                  if (activeFolder === folderName) setActiveFolder("");
                                  toast.success(`Đã xóa thư mục: ${folderName}`);
                                }
                              }}
                              className="opacity-0 group-hover/folder:opacity-100 p-0.5 hover:text-red-650 transition-opacity flex items-center justify-center"
                              title="Ẩn thư mục"
                            >
                              <X size={10} className="font-bold text-gray-500 hover:text-red-650" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Main Content */}
                <div className="lg:col-span-9 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 min-h-[500px]">
                  {/* Breadcrumb row */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                      <span className="cursor-pointer hover:text-gray-900" onClick={() => setActiveFolder("")}>Root</span>
                      {activeFolder && (
                        <>
                          <ChevronRight size={12} className="text-gray-450" />
                          <span className="text-gray-900">{activeFolder}</span>
                        </>
                      )}
                    </div>

                    {/* Sorting select */}
                    <div className="relative">
                      <select 
                        value={mediaSort}
                        onChange={(e) => setMediaSort(e.target.value as any)}
                        className="pl-3 pr-7 py-1 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 appearance-none bg-white focus:outline-none min-w-[90px] cursor-pointer"
                      >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="az">Tên A-Z</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 py-1">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#eb5757] focus:ring-[#eb5757]/20 cursor-pointer" />
                    <span>Chọn tất cả</span>
                    <span className="text-gray-500 font-medium ml-1.5">{filteredMedia.length} file</span>
                  </div>

                  {/* Cards Grid */}
                  {mediaLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="border border-gray-250 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between animate-pulse">
                          <div className="aspect-[4/3] w-full bg-gray-150" />
                          <div className="p-3.5 space-y-2">
                            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                            <div className="flex justify-between items-center pt-2">
                              <div className="h-2.5 bg-gray-200 rounded w-1/4" />
                              <div className="h-2.5 bg-gray-200 rounded w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : paginatedMedia.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
                        {paginatedMedia.map((item) => {
                          const formattedDate = (() => {
                            if (item.createdAt.includes("/")) return item.createdAt;
                            const parts = item.createdAt.split("-");
                            if (parts.length === 3) {
                              return `${parts[2]}/${parts[1]}/${parts[0]}`;
                            }
                            return item.createdAt;
                          })();

                          return (
                            <div
                              key={item.id}
                              className="group relative border border-gray-250 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-350 animate-fade-in"
                            >
                              {/* Thumbnail */}
                              <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden flex items-center justify-center border-b border-gray-150">
                                {item.type === "video" ? (
                                  <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                                    {item.url.startsWith("http") ? (
                                      <div className="w-full h-full flex items-center justify-center text-white/50">
                                        <Video className="w-8 h-8" />
                                      </div>
                                    ) : (
                                      <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover opacity-80"
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                      <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-900 shadow-md group-hover:scale-110 transition-transform">
                                        <svg className="w-4.5 h-4.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                        </svg>
                                      </div>
                                    </div>
                                    <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-white font-mono font-bold">
                                      {item.duration || "00:00"}
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-102 transition-all duration-500"
                                  />
                                )}

                                {/* Glassmorphic Hover Action Overlay */}
                                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copyUrl = item.url.startsWith("blob:") || item.url.startsWith("data:") || item.url.startsWith("http") ? item.url : (window.location.origin + item.url);
                                      navigator.clipboard.writeText(copyUrl);
                                      toast.success("Đã sao chép link media vào bộ nhớ tạm!");
                                    }}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center shadow transition-all active:scale-95"
                                    title="Sao chép đường dẫn"
                                    >
                                      <Copy size={13} />
                                    </button>
                                    <button
                                    type="button"
                                    onClick={() => setMediaPreviewItem(item)}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center shadow transition-all active:scale-95"
                                    title="Xem trước"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (confirm("Bạn có chắc chắn muốn xóa file media này không?")) {
                                        try {
                                          setDeletingMediaKey(item.key);
                                          toast.loading("Đang xóa...", { id: "media-delete" });
                                          await deleteAdminMedia(item.key);
                                          toast.success("Đã xóa file media thành công!", { id: "media-delete" });
                                          loadMedia();
                                        } catch (err) {
                                          toast.error("Lỗi khi xóa file media!", { id: "media-delete" });
                                        } finally {
                                          setDeletingMediaKey(null);
                                        }
                                      }
                                    }}
                                    disabled={deletingMediaKey === item.key}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-red-650 flex items-center justify-center shadow transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                                    title="Xóa media"
                                  >
                                    {deletingMediaKey === item.key ? (
                                      <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={13} />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Info Panel */}
                              <div className="p-3 bg-gray-50 flex flex-col gap-1 border-t border-gray-150">
                                <h5 className="text-[11px] font-bold text-gray-800 truncate leading-snug" title={item.title}>
                                  {item.title}
                                </h5>
                                <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold">
                                  <span>{item.size}</span>
                                  <span>{formattedDate}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination footer */}
                      <div className="flex justify-center mt-6">
                        <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200">
                          
                          {/* Prev Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (mediaPage > 1) setMediaPage(mediaPage - 1);
                            }}
                            disabled={mediaPage === 1}
                            className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {/* Page Numbers */}
                          {Array.from({ length: mediaTotalPages }).map((_, idx) => {
                            const pageNumber = idx + 1;
                            const isCurrent = mediaPage === pageNumber;

                            return (
                              <button
                                key={pageNumber}
                                type="button"
                                onClick={() => setMediaPage(pageNumber)}
                                className={`px-4 py-2 text-xs font-bold transition-all ${
                                  isCurrent
                                    ? "bg-[#eb5757] text-white"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}

                          {/* Next Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (mediaPage < mediaTotalPages) setMediaPage(mediaPage + 1);
                            }}
                            disabled={mediaPage === mediaTotalPages}
                            className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>

                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center text-gray-400 font-bold flex-1 flex items-center justify-center">
                      Không tìm thấy file media nào tương ứng.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
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
                  onClick={handleOpenAddDialog}
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
                  
                  {/* Search Field (Always present) */}
                  <div className={activeTab === "posts" ? "md:col-span-4" : "md:col-span-12"}>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                      Tìm kiếm thông tin
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          activeTab === "posts"
                            ? "Tìm kiếm tiêu đề, ID bài viết..."
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
                        <div className="relative">
                          <input
                            type="date"
                            value={postStartDate}
                            onChange={(e) => setPostStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Ngày kết thúc
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={postEndDate}
                            onChange={(e) => setPostEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Danh mục
                        </label>
                        <select
                          value={postCategoryFilter}
                          onChange={(e) => setPostCategoryFilter(e.target.value)}
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
                          onClick={() => resetFilters()}
                          className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-bold rounded-xl transition-all"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>

                      {activeTab === "posts" && (
                        <div className="md:col-span-9 flex items-center mt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 font-medium select-none w-max">
                            <input 
                              type="checkbox" 
                              checked={hideDeletedPosts} 
                              onChange={(e) => setHideDeletedPosts(e.target.checked)} 
                              className="w-4 h-4 rounded text-[#E55956] focus:ring-[#E55956] cursor-pointer" 
                            />
                            Ẩn bài viết đã xóa
                          </label>
                        </div>
                      )}
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
                            <tr key={post.id} className={`transition-colors text-sm font-medium whitespace-nowrap ${post.isDeleted ? 'opacity-50 bg-red-50/20' : 'hover:bg-gray-50/50'}`}>
                              <td className="py-4 px-6 text-center text-gray-400 font-bold">{post.id}</td>
                              <td className="py-4 px-4 whitespace-normal">
                                <div className="text-gray-900 font-semibold line-clamp-2 max-w-[450px]">
                                  {post.title}
                                  {post.isDeleted && <span className="ml-2 px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded whitespace-nowrap align-middle font-bold">Đã xóa</span>}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-600">{post.category}</td>
                              <td className="py-4 px-4 text-right text-gray-900 font-mono font-bold">
                                {post.views.toLocaleString("en-US")}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                    post.status === "Đã đăng"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {post.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-gray-500">
                                {formatDateForDisplay(post.createdAt)}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(post)}
                                    className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <SquarePen size={15} />
                                  </button>
                                  {post.isDeleted ? (
                                    <button
                                      type="button"
                                      onClick={() => executeRestore(post.id)}
                                      disabled={restoringPostId === post.id}
                                      className="p-1.5 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                                      title="Khôi phục bài viết"
                                    >
                                      {restoringPostId === post.id ? (
                                        <Loader2 size={15} className="animate-spin" />
                                      ) : (
                                        <RotateCcw size={15} />
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmDelete(post.id)}
                                      className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                      title="Xóa bài viết"
                                    >
                                      <Trash2 size={15} />
                                    </button>
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
                    <table className="w-full min-w-[800px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                          <th className="py-4 px-6 w-16 text-center">ID</th>
                          <th className="py-4 px-4 min-w-[200px]">Tên danh mục</th>
                          <th className="py-4 px-4 w-44 text-right">Số bài viết</th>
                          <th className="py-4 px-4 w-40 text-center">Priority</th>
                          <th className="py-4 px-4 w-40 text-center">Trạng thái</th>
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
                              <td className="py-4 px-4 text-gray-900 font-semibold whitespace-normal">{cat.name}</td>
                              <td className="py-4 px-4 text-right text-gray-900 font-mono font-bold">
                                {cat.postCount}
                              </td>
                              <td className="py-4 px-4 text-center text-gray-600 font-bold">{cat.priority}</td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                    cat.status === "Hoạt động"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {cat.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(cat)}
                                    className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <SquarePen size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelete(cat.id)}
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
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                    ad.status === "Hoạt động"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : ad.status === "Chờ chạy"
                                      ? "bg-blue-100 text-blue-800"
                                      : ad.status === "Đã kết thúc"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {ad.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(ad)}
                                    className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <SquarePen size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelete(ad.id)}
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
                          <th className="py-4 px-4 w-32 text-center">Vai trò</th>
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
                                {(accountsPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td className="py-4 px-4 text-gray-900 font-semibold">{acc.username}</td>
                              <td className="py-4 px-4 text-gray-750">{acc.display_name}</td>
                              <td className="py-4 px-4 text-gray-600">{acc.email || "(Chưa cấu hình)"}</td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                                  {acc.role}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-gray-500">
                                {formatDateForDisplay(acc.created_at ? acc.created_at.split("T")[0] : "")}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(acc)}
                                    className="p-1.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                    title="Sửa tài khoản"
                                  >
                                    <SquarePen size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDeleteAccount(acc.id)}
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
                  <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200">
                    
                    {/* Prev Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "posts" && postsPage > 1) setPostsPage(postsPage - 1);
                        if (activeTab === "categories" && categoriesPage > 1) setCategoriesPage(categoriesPage - 1);
                        if (activeTab === "ads" && adsPage > 1) setAdsPage(adsPage - 1);
                        if (activeTab === "accounts" && accountsPage > 1) setAccountsPage(accountsPage - 1);
                      }}
                      disabled={
                        (activeTab === "posts" && postsPage === 1) ||
                        (activeTab === "categories" && categoriesPage === 1) ||
                        (activeTab === "ads" && adsPage === 1) ||
                        (activeTab === "accounts" && accountsPage === 1)
                      }
                      className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({
                      length:
                        activeTab === "posts"
                          ? postsTotalPages
                          : activeTab === "categories"
                          ? categoriesTotalPages
                          : activeTab === "ads"
                          ? adsTotalPages
                          : accountsTotalPages
                    }).map((_, idx) => {
                      const pageNumber = idx + 1;
                      const isCurrent =
                        activeTab === "posts"
                          ? postsPage === pageNumber
                          : activeTab === "categories"
                          ? categoriesPage === pageNumber
                          : activeTab === "ads"
                          ? adsPage === pageNumber
                          : accountsPage === pageNumber;

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => {
                            if (activeTab === "posts") setPostsPage(pageNumber);
                            if (activeTab === "categories") setCategoriesPage(pageNumber);
                            if (activeTab === "ads") setAdsPage(pageNumber);
                            if (activeTab === "accounts") setAccountsPage(pageNumber);
                          }}
                          className={`px-4 py-2 text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-[#E55956] text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "posts" && postsPage < postsTotalPages) setPostsPage(postsPage + 1);
                        if (activeTab === "categories" && categoriesPage < categoriesTotalPages) setCategoriesPage(categoriesPage + 1);
                        if (activeTab === "ads" && adsPage < adsTotalPages) setAdsPage(adsPage + 1);
                        if (activeTab === "accounts" && accountsPage < accountsTotalPages) setAccountsPage(accountsPage + 1);
                      }}
                      disabled={
                        (activeTab === "posts" && postsPage === postsTotalPages) ||
                        (activeTab === "categories" && categoriesPage === categoriesTotalPages) ||
                        (activeTab === "ads" && adsPage === adsTotalPages) ||
                        (activeTab === "accounts" && accountsPage === accountsTotalPages)
                      }
                      className="px-3 py-2 hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>

                  </div>
                </div>

              </div>
            </>
          )}
        </main>

      </div>

      {/* ==========================================
          MODAL: ADD / EDIT DIALOG FORM
          ========================================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl p-6 border-none shadow-2xl bg-white text-[#2c3e50] outline-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <PlusCircle size={20} className="text-[#E55956]" />
              <span>
                {dialogMode === "add" ? "Thêm mới" : "Cập nhật"}{" "}
                {activeTab === "posts" && "bài viết"}
                {activeTab === "categories" && "danh mục"}
                {activeTab === "ads" && "quảng cáo"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-3">
            {/* POSTS FIELDS */}
            {activeTab === "posts" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Tiêu đề bài viết
                  </label>
                  <input
                    type="text"
                    value={postForm.title || ""}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Danh mục
                    </label>
                    <select
                      value={postForm.category || ""}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Trạng thái
                    </label>
                    <select
                      value={postForm.status || ""}
                      onChange={(e) =>
                        setPostForm({ ...postForm, status: e.target.value as "Đã đăng" | "Nháp" })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    >
                      <option value="Đã đăng">Đã đăng</option>
                      <option value="Nháp">Nháp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Lượt xem
                    </label>
                    <input
                      type="number"
                      value={postForm.views ?? 0}
                      onChange={(e) => setPostForm({ ...postForm, views: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Ngày tạo
                    </label>
                    <input
                      type="date"
                      value={postForm.createdAt || ""}
                      onChange={(e) => setPostForm({ ...postForm, createdAt: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>
              </>
            )}





            <DialogFooter className="pt-4 border-t border-gray-100 flex flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                disabled={isPostSaving}
                className="px-4.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isPostSaving}
                className="px-5 py-2 bg-[#E55956] hover:bg-[#cb4643] text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isPostSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{dialogMode === "add" ? "Thêm mới" : "Lưu thay đổi"}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: ADD / EDIT CATEGORY DIALOG FORM
          ========================================== */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {dialogMode === "add" ? "Thêm danh mục" : "Sửa danh mục"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Tên danh mục
              </label>
              <input
                type="text"
                value={categoryForm.name || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Nhập tên danh mục..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Priority
              </label>
              <div className="relative">
                <select
                  value={categoryForm.priority ?? 0}
                  onChange={(e) => setCategoryForm({ ...categoryForm, priority: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  {Array.from({ length: 11 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={categoryForm.status || "Hoạt động"}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value as "Hoạt động" | "Ngừng hoạt động" })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-6 pb-2">
              <button
                type="button"
                onClick={() => setCategoryDialogOpen(false)}
                disabled={isCategorySaving}
                className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCategorySaving}
                className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed gap-2"
              >
                {isCategorySaving && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{dialogMode === "add" ? "Thêm" : "Sửa"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: ADD / EDIT AD DIALOG FORM
          ========================================== */}
      <Dialog open={adDialogOpen} onOpenChange={setAdDialogOpen}>
        <DialogContent className="max-w-[480px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {dialogMode === "add" ? "Thêm quảng cáo" : "Sửa quảng cáo"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Tên quảng cáo
              </label>
              <input
                type="text"
                value={adForm.name || ""}
                onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
                placeholder="Nhập tên quảng cáo..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Vị trí quảng cáo
              </label>
              <div className="relative">
                <select
                  value={adForm.position || "header"}
                  onChange={(e) => setAdForm({ ...adForm, position: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="header">Header</option>
                  <option value="sidebar_1">SideBar 1</option>
                  <option value="sidebar_2">SideBar 2</option>
                  <option value="sidebar_3">SideBar 3</option>
                  <option value="inline">Inline</option>
                  <option value="footer">Footer</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Thời gian quảng cáo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold text-gray-900">
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 text-gray-800 w-8 text-left">Từ:</span>
                  <input
                    type="date"
                    value={adForm.startDate || ""}
                    onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 text-gray-800 w-8 text-left">Đến:</span>
                  <input
                    type="date"
                    value={adForm.endDate || ""}
                    onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Thiết lập hoạt động
              </label>
              <div className="relative">
                <select
                  value={adForm.status === "Ngừng hoạt động" ? "Ngừng hoạt động" : "Hoạt động"}
                  onChange={(e) => setAdForm({ ...adForm, status: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="Hoạt động">Kích hoạt quảng cáo</option>
                  <option value="Ngừng hoạt động">Tắt quảng cáo</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {dialogMode === "edit" && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-500">Trạng thái hiển thị thực tế:</span>
                <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                  adForm.status === "Hoạt động" ? "bg-emerald-100 text-emerald-800" :
                  adForm.status === "Chờ chạy" ? "bg-blue-100 text-blue-800" :
                  adForm.status === "Đã kết thúc" ? "bg-gray-100 text-gray-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {adForm.status}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Link liên kết (Không bắt buộc)
              </label>
              <input
                type="url"
                value={adForm.link || ""}
                onChange={(e) => setAdForm({ ...adForm, link: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Ảnh quảng cáo
              </label>
              {adForm.image ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[2.2/1] w-full flex-shrink-0 bg-gray-50 flex items-center justify-center">
                  {adForm.link ? (
                    <a
                      href={adForm.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full block cursor-pointer animate-none"
                      title="Ấn để kiểm tra liên kết quảng cáo"
                    >
                      <img src={adForm.image} alt="Ad Preview" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300" />
                    </a>
                  ) : (
                    <img src={adForm.image} alt="Ad Preview" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                    {adForm.link && (
                      <a
                        href={adForm.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#E55956]/90 hover:bg-[#E55956] text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1 active:scale-95 pointer-events-auto"
                      >
                        <ExternalLink size={12} />
                        <span>Thử Link</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => { const f = { ...adForm }; delete (f as any).image; setAdForm(f); }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95 pointer-events-auto"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("ad-upload-input")?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#E55956] hover:bg-[#E55956]/5 transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer aspect-[2.2/1] w-full group bg-gray-50/20"
                >
                  <Upload size={24} className="text-gray-400 group-hover:text-[#E55956] transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-[#E55956] transition-colors">
                    Click để tải ảnh hoặc kéo thả
                  </span>
                  <input
                    type="file"
                    id="ad-upload-input"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAdForm({ ...adForm, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 pb-2">
              <button
                type="button"
                onClick={() => setAdDialogOpen(false)}
                disabled={isAdSaving}
                className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isAdSaving}
                className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed gap-2"
              >
                {isAdSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{dialogMode === "add" ? "Thêm" : "Sửa"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: ADD / EDIT ACCOUNT DIALOG FORM
          ========================================== */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {dialogMode === "add" ? "Thêm tài khoản" : "Sửa tài khoản"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={accountForm.username || ""}
                onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                placeholder="Nhập tên đăng nhập (ví dụ: admin01)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
                disabled={dialogMode === "edit"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={accountForm.display_name || ""}
                onChange={(e) => setAccountForm({ ...accountForm, display_name: e.target.value })}
                placeholder="Nhập tên hiển thị..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Email
              </label>
              <input
                type="email"
                value={accountForm.email || ""}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                placeholder="Nhập địa chỉ email..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Mật khẩu {dialogMode === "edit" && "(Để trống nếu không muốn đổi)"}
              </label>
              <input
                type="password"
                value={accountForm.password || ""}
                onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                placeholder={dialogMode === "add" ? "Nhập mật khẩu (tối thiểu 6 ký tự)..." : "Nhập mật khẩu mới..."}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
                required={dialogMode === "add"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Vai trò
              </label>
              <div className="relative">
                <select
                  value={accountForm.role || "admin"}
                  onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-semibold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="admin">Administrator</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-6 pb-2">
              <button
                type="button"
                onClick={() => setAccountDialogOpen(false)}
                disabled={isAccountSaving}
                className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isAccountSaving}
                className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed gap-2"
              >
                {isAccountSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{dialogMode === "add" ? "Thêm" : "Sửa"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          CONFIRM DELETE DIALOG
          ========================================== */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              {activeTab === "posts" && "Xóa bài viết"}
              {activeTab === "categories" && "Xóa danh mục"}
              {activeTab === "ads" && "Xóa quảng cáo"}
              {activeTab === "accounts" && "Xóa tài khoản"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900 leading-snug">
              {activeTab === "posts" && "Bạn có chắc chắn muốn xóa bài viết"}
              {activeTab === "categories" && "Bạn có chắc chắn muốn xóa danh mục"}
              {activeTab === "ads" && "Bạn có chắc chắn muốn xóa quảng cáo"}
              {activeTab === "accounts" && "Bạn có chắc chắn muốn xóa tài khoản"}
            </h3>
            <p className="text-sm font-semibold text-[#E55956]">
              Dữ liệu bị xóa sẽ không thể khôi phục
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pb-2">
            <button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setTargetIdToDelete(null);
                setTargetAccountIdToDelete(null);
              }}
              disabled={isDeleting}
              className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Không
            </button>
            <button
              onClick={executeDelete}
              disabled={isDeleting}
              className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed gap-2"
            >
              {isDeleting && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>Có</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          CONFIRM LOGOUT DIALOG
          ========================================== */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              Đăng xuất
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900 leading-snug">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </h3>
            <p className="text-sm font-semibold text-gray-400">
              Phiên làm việc hiện tại của bạn trên thiết bị này sẽ kết thúc
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pb-2">
            <button
              onClick={() => setLogoutDialogOpen(false)}
              className="flex-1 max-w-[144px] py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
            >
              Hủy
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 max-w-[144px] py-3 bg-[#e86b6b] hover:bg-[#e55956] text-white text-lg font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Đồng ý
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
        MODAL: CREATE FOLDER DIALOG
        ========================================== */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="max-w-[460px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 border border-gray-100 shadow-2xl bg-white text-[#2c3e50] outline-none [&>button]:hidden">
          <DialogHeader className="border-b border-gray-150 pb-3 -mx-6 px-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              Tạo thư mục mới
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Tên thư mục
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nhập tên thư mục..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E55956] focus:ring-2 focus:ring-[#E55956]/15 transition-all bg-white shadow-sm font-medium"
              />
            </div>

            {activeFolder && (
              <p className="text-xs font-semibold text-gray-400">
                Thư mục mới sẽ được tạo bên trong: <strong className="text-gray-700">{activeFolder}</strong>
              </p>
            )}

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={() => setFolderDialogOpen(false)}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newFolderName.trim()) {
                    toast.error("Vui lòng nhập tên thư mục!");
                    return;
                  }
                  try {
                    toast.loading("Đang tạo thư mục...", { id: "media-folder" });
                    await createAdminFolder(newFolderName.trim(), activeFolder);
                    toast.success(`Đã thêm thư mục: ${newFolderName.trim()}`, { id: "media-folder" });
                    setFolderDialogOpen(false);
                    setNewFolderName("");

                    // Reload folders list
                    await loadFolders();
                  } catch (err) {
                    toast.error("Lỗi khi tạo thư mục!", { id: "media-folder" });
                  }
                }}
                className="px-5 py-2.5 bg-[#E55956] hover:bg-[#d44e4b] text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                Tạo
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

              {/* ==========================================
          MODAL: MEDIA PREVIEW DIALOG
          ========================================== */}
      <Dialog open={mediaPreviewItem !== null} onOpenChange={(open) => {
        if (!open) setMediaPreviewItem(null);
      }}>
        <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto rounded-[24px] p-5 border border-gray-100 shadow-2xl bg-slate-950 text-white outline-none flex flex-col gap-4 [&>button]:text-white">
          <DialogHeader className="border-b border-white/10 pb-3">
            <DialogTitle className="text-base font-bold text-white truncate text-left pr-8">
              Preview: {mediaPreviewItem?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5 shadow-inner">
            {mediaPreviewItem?.type === "video" ? (
              <video
                src={mediaPreviewItem.url}
                controls
                autoPlay
                className="w-full max-h-[450px] object-contain"
              />
            ) : (
              mediaPreviewItem && (
                <img
                  src={mediaPreviewItem.url}
                  alt={mediaPreviewItem.title}
                  className="w-full h-full object-contain"
                />
              )
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-gray-400 gap-3 border-t border-white/5 pt-3">
            <div className="space-y-1">
              <p>
                Đường dẫn: <span className="font-mono text-white select-all">{mediaPreviewItem?.url}</span>
              </p>
              <div className="flex gap-4">
                <span>Dung lượng: <strong className="text-white">{mediaPreviewItem?.size}</strong></span>
                {mediaPreviewItem?.dimensions && (
                  <span>Độ phân giải: <strong className="text-white font-mono">{mediaPreviewItem.dimensions}</strong></span>
                )}
                {mediaPreviewItem?.duration && (
                  <span>Thời lượng: <strong className="text-white font-mono">{mediaPreviewItem.duration}</strong></span>
                )}
                <span>Ngày tạo: <strong className="text-white">{mediaPreviewItem?.createdAt}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (mediaPreviewItem) {
                  const copyUrl = mediaPreviewItem.url.startsWith("blob:") || mediaPreviewItem.url.startsWith("data:") || mediaPreviewItem.url.startsWith("http") ? mediaPreviewItem.url : (window.location.origin + mediaPreviewItem.url);
                  navigator.clipboard.writeText(copyUrl);
                  toast.success("Đã sao chép link media vào bộ nhớ tạm!");
                }
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center"
            >
              <Copy size={13} />
              <span>Copy Link</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
