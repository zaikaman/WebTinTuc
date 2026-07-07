import type { SiteSettings } from "@/lib/types/news";

interface FooterProps {
  settings?: Pick<SiteSettings, "brand" | "footer">;
}

export function Footer({ settings }: FooterProps = {}) {
  const copyright = settings?.brand?.copyright || "Công ty TNHH PHD STUDIO";
  const address = settings?.footer?.address || "246 Lê Đình Cẩn, phường Tân Tạo, quận Bình Tân, Thành phố Hồ Chí Minh";
  const responsible = settings?.footer?.responsible || "Ông Phạm Hải Đăng";
  const phone = settings?.footer?.phone || "0327906965";
  const email = settings?.footer?.email || "congtyphdstudio@gmail.com";
  const license = settings?.footer?.license || "...(đợi văn bản chính thức)";

  return (
    <footer className="mt-0 bg-[#2d2d2d] border-t-8 border-brand-red text-white">
      <div className="px-4 py-8 max-w-[970px] mx-auto text-center space-y-2 text-[12px] leading-relaxed text-gray-200">
        <p>
          Vận hành bởi <strong className="font-bold text-white">{copyright}</strong>
        </p>
        <p>
          Địa chỉ: {address}
        </p>
        <p>
          Chịu trách nhiệm quản lý nội dung: <strong className="font-bold text-white">{responsible}</strong> - SĐT: {phone} - Email: {email}
        </p>
        <p>
          Giấy phép thiết lập trang Thông tin điện tử trên mạng số {license}
        </p>
      </div>
    </footer>
  );
}


