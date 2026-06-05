import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteSettings } from "@/lib/types/news";

interface FooterProps {
  settings: Pick<SiteSettings, "brand" | "footer">;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="mt-0 bg-[#333] border-t-4 border-brand-red text-white">
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-red px-3 py-2 text-white font-bold tracking-tighter text-lg rounded-sm">
                {settings.brand.name}
              </div>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              {settings.brand.footerDescription}
            </p>
          </div>
          {settings.footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-brand-red font-bold text-xs mb-3 uppercase">{column.title}</h3>
              <ul className="space-y-1.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}-${link.href}`}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-[11px]">{settings.brand.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href?: string; children: ReactNode }) {
  const className = "text-gray-300 text-[11px] hover:text-white transition-colors";

  if (!href) {
    return <span className={className}>{children}</span>;
  }

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}
