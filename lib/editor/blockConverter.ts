export interface Block {
  type: string;
  text?: string;
  src?: string;
  caption?: string;
  width?: string;
}

export const htmlToBlocks = (html: string): Block[] => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: Block[] = [];
  
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

export const blocksToHtml = (blocks: Block[] | string): string => {
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
