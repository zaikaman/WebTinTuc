import { Globe, Cpu, Sparkles, BookOpen, Coins, Trophy, Heart, Layers } from "lucide-react";

// ==========================================
// HTML <-> BLOCK CONVERSION
// ==========================================

export const htmlToBlocks = (html: string) => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: any[] = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({ type: 'paragraph', text });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;

    if (el.nodeName === 'P') {
      blocks.push({
        type: 'paragraph',
        text: el.innerHTML,
        align: el.style.textAlign || undefined,
        fontFamily: el.style.fontFamily || undefined,
        fontSize: el.style.fontSize || undefined,
        style: el.getAttribute('style') || undefined,
      });
    } else if (el.nodeName === 'UL' || el.nodeName === 'OL') {
      blocks.push({
        type: 'list',
        listType: el.nodeName.toLowerCase() as 'ul' | 'ol',
        text: el.innerHTML,
        align: el.style.textAlign || undefined,
      });
    } else if (el.nodeName === 'DIV') {
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
          blocks.push({ type: 'image', src, caption, width, id: el.id });
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
        if (el.getAttribute('contenteditable') !== 'false' && el.innerHTML.trim()) {
          blocks.push({
            type: 'paragraph',
            text: el.innerHTML,
            align: el.style.textAlign || undefined,
            fontFamily: el.style.fontFamily || undefined,
            fontSize: el.style.fontSize || undefined,
            style: el.getAttribute('style') || undefined,
          });
        }
      }
    } else if (el.nodeName === 'VIDEO') {
      const src = el.getAttribute('src');
      if (src) blocks.push({ type: 'video', src });
    } else if (el.nodeName === 'IFRAME') {
      const src = el.getAttribute('src');
      if (src) blocks.push({ type: 'iframe', src });
    } else if (el.innerHTML.trim()) {
      blocks.push({
        type: 'paragraph',
        text: el.outerHTML,
        align: el.style.textAlign || undefined,
      });
    }
  });
  return blocks;
};

export const blocksToHtml = (blocks: any[]) => {
  if (!Array.isArray(blocks)) return typeof blocks === 'string' ? blocks : '';
  const htmlList = blocks.map((block) => {
    if (block.type === 'paragraph') {
      let styleAttr = '';
      const styles: string[] = [];
      if (block.align) styles.push(`text-align: ${block.align};`);
      if (block.fontFamily) styles.push(`font-family: ${block.fontFamily};`);
      if (block.fontSize) styles.push(`font-size: ${block.fontSize};`);
      if (block.style) {
        const parsedStyle = block.style.trim();
        if (parsedStyle) {
          styles.push(parsedStyle.endsWith(';') ? parsedStyle : parsedStyle + ';');
        }
      }
      if (styles.length > 0) {
        const uniqueStyles = Array.from(new Set(styles));
        styleAttr = ` style="${uniqueStyles.join(' ')}"`;
      }
      return `<p${styleAttr}>${block.text || ''}</p>`;
    } else if (block.type === 'bold-paragraph') {
      return `<p><strong>${block.text || ''}</strong></p>`;
    } else if (block.type === 'list') {
      const tag = block.listType || 'ul';
      let styleAttr = '';
      if (block.align) styleAttr = ` style="text-align: ${block.align};"`;
      return `<${tag}${styleAttr}>${block.text || ''}</${tag}>`;
    } else if (block.type === 'image') {
      const width = block.width || '100%';
      const wrapperId = block.id || 'img-' + Math.random().toString(36).substring(2, 9);
      return `<div id="${wrapperId}" class="my-4 relative group" contenteditable="false" style="max-width: ${width}; margin: 0 auto;">
  <img src="${block.src || ''}" alt="${block.caption || ''}" class="w-full rounded-xl border border-gray-200 shadow-sm" />
  ${block.caption ? `<p class="text-center text-xs italic text-gray-500 mt-1.5">${block.caption}</p>` : ''}
  <button type="button" onclick="const p=this.parentElement; const ed=p.closest('[contenteditable]'); p.remove(); if(ed) ed.dispatchEvent(new Event('input',{bubbles:true}));" class="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all z-30" title="Xóa hình ảnh">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] text-white font-bold select-none z-30 w-max min-w-max">
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
    } else if (block.type === 'video') {
      const width = block.width || '100%';
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
    } else if (block.type === 'iframe') {
      const width = block.width || '100%';
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
// DATE HELPERS
// ==========================================

export const formatDateForDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

// ==========================================
// CATEGORY STYLE MAPPING
// ==========================================

export const getCategoryStyles = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('tin tức') || lower.includes('tin') || lower.includes('thời sự') || lower.includes('xã hội')) {
    return { color: 'from-[#ef4444] to-[#E55956]', bg: 'bg-rose-50 text-[#E55956]', icon: Globe };
  }
  if (lower.includes('công nghệ') || lower.includes('tech') || lower.includes('khoa học')) {
    return { color: 'from-[#3b82f6] to-[#1d4ed8]', bg: 'bg-blue-50 text-[#1d4ed8]', icon: Cpu };
  }
  if (lower.includes('giải trí') || lower.includes('anime') || lower.includes('manga') || lower.includes('phim') || lower.includes('nhạc')) {
    return { color: 'from-[#a855f7] to-[#7c3aed]', bg: 'bg-purple-50 text-[#7c3aed]', icon: Sparkles };
  }
  if (lower.includes('giáo dục') || lower.includes('học tập') || lower.includes('trường học')) {
    return { color: 'from-[#10b981] to-[#047857]', bg: 'bg-emerald-50 text-[#047857]', icon: BookOpen };
  }
  if (lower.includes('kinh tế') || lower.includes('tài chính') || lower.includes('doanh nghiệp') || lower.includes('kinh doanh')) {
    return { color: 'from-[#f59e0b] to-[#b45309]', bg: 'bg-amber-50 text-[#b45309]', icon: Coins };
  }
  if (lower.includes('thể thao') || lower.includes('bóng đá')) {
    return { color: 'from-[#f97316] to-[#c2410c]', bg: 'bg-orange-50 text-[#c2410c]', icon: Trophy };
  }
  if (lower.includes('đời sống') || lower.includes('sức khỏe') || lower.includes('du lịch')) {
    return { color: 'from-[#ec4899] to-[#be185d]', bg: 'bg-pink-50 text-[#be185d]', icon: Heart };
  }
  return { color: 'from-[#06b6d4] to-[#0369a1]', bg: 'bg-cyan-50 text-[#0369a1]', icon: Layers };
};
