import type { SiteSettings } from "@/lib/types/news";

interface FooterProps {
  settings?: Pick<SiteSettings, "brand" | "footer">;
}

export function Footer(_props: FooterProps = {}) {
  return (
    <footer className="mt-0 bg-[#2d2d2d] border-t-8 border-brand-red text-white">
      <div className="px-4 py-8 max-w-[970px] mx-auto text-center space-y-2 text-[12px] leading-relaxed text-gray-200">
        <p>
          Vận hành bởi <strong className="font-bold text-white">Công ty TNHH PHD STUDIO</strong>
        </p>
        <p>
          Địa chỉ: 246 Lê Đình Cẩn, phường Tân Tạo, quận Bình Tân, Thành phố Hồ Chí Minh
        </p>
        <p>
          Chịu trách nhiệm quản lý nội dung: <strong className="font-bold text-white">Ông Phạm Hải Đăng</strong> - SĐT:0327906965- Email:congtyphdstudio@gmail.com
        </p>
        <p>
          Giấy phép thiết lập trang Thông tin điện tử trên mạng số ...(đợi văn bản chính thức)
        </p>
      </div>
    </footer>
  );
}

