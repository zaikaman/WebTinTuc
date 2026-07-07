function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const highlightText = (text, highlight) => {
  if (!highlight.trim()) return text;

  const pattern = escapeRegExp(highlight)
    .replace(/[aàáảãạăằắẳẵặâầấẩẫậAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ]/g, "[aàáảãạăằắẳẵặâầấẩẫậAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ]")
    .replace(/[eèéẻẽẹêềếểễệEÈÉẺẼẸÊỀẾỂỄỆ]/g, "[eèéẻẽẹêềếểễệEÈÉẺẼẸÊỀẾỂỄỆ]")
    .replace(/[iìíỉĩịIÌÍỈĨỊ]/g, "[iìíỉĩịIÌÍỈĨỊ]")
    .replace(/[oòóỏõọôồốổỗộơờớởỡợOÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ]/g, "[oòóỏõọôồốổỗộơờớởỡợOÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ]")
    .replace(/[uùúủũụưừứửữựUÙÚỦŨỤƯỪỨỬỮỰ]/g, "[uùúủũụưừứửữựUÙÚỦŨỤƯỪỨỬỮỰ]")
    .replace(/[yỳýỷỹỵYỲÝỶỸỴ]/g, "[yỳýỷỹỵYỲÝỶỸỴ]")
    .replace(/[dđDĐ]/g, "[dđDĐ]");

  const maxLen = 50;
  const highlightLen = highlight.length;

  let snippet = text;
  let prefix = "";
  let suffix = "";

  if (text.length > maxLen) {
    const regex = new RegExp(`(${pattern})`, "gi");
    const match = regex.exec(text);
    const idx = match ? match.index : -1;

    if (idx !== -1) {
      let start = Math.max(0, idx - 18);
      let end = Math.min(text.length, idx + highlightLen + 28);

      if (start === 0) {
        end = Math.min(text.length, maxLen);
      }
      if (end === text.length) {
        start = Math.max(0, text.length - maxLen);
      }

      snippet = text.slice(start, end);

      if (start > 0) {
        const firstSpace = snippet.indexOf(" ");
        if (firstSpace !== -1 && firstSpace < 12) {
          snippet = snippet.slice(firstSpace + 1);
        }
        prefix = "... ";
      }

      if (end < text.length) {
        const lastSpace = snippet.lastIndexOf(" ");
        if (lastSpace !== -1 && snippet.length - lastSpace < 12) {
          snippet = snippet.slice(0, lastSpace);
        }
        suffix = " ...";
      }
    } else {
      snippet = text.slice(0, maxLen);
      suffix = " ...";
    }
  }

  const finalStr = prefix + snippet + suffix;
  console.log("Snippet output:", finalStr);
  return finalStr;
};

const title = "Sức hút của môn quần vợt (Tennis) phong trào tại Việt Nam: Khi rèn luyện sức khỏe kết hợp giao lưu kết nối";
highlightText(title, "kết");
highlightText(title, "quần vợt");
highlightText(title, "Sức hút");
