"use client";

import Image from "next/image";

type Partner = {
  name: string;
  role: string;
  href?: string;
  src?: string;
  demo?: boolean;
};

const partners: Partner[] = [
  { name: "Kho Nệm Giá Tốt", role: "Đối tác phân phối", href: "https://khonemgiatot.vn/", src: "/images/partners/kho-nem-gia-tot.png" },
  { name: "Saigon Rosee Haven", role: "Đối tác lưu trú", href: "http://saigonroseehotel.com/", src: "/images/partners/saigon-rosee-haven.png" },
  { name: "Horizon Boutique", role: "Demo đối tác", demo: true },
  { name: "Luma Stay", role: "Demo đối tác", demo: true },
  { name: "Riverside Residence", role: "Demo đối tác", demo: true },
  { name: "An Nhiên ApartHotel", role: "Demo đối tác", demo: true },
  { name: "The Brique Hotel", role: "Demo đối tác", demo: true },
  { name: "Maison De Ville", role: "Demo đối tác", demo: true },
];

function PartnerCard({ partner }: { partner: Partner }) {
  const content = <>
    <div className="flex h-14 items-center">
      {partner.src ? (
        <Image src={partner.src} alt={`${partner.name} logo`} width={232} height={96} className="max-h-14 w-auto max-w-[220px] object-contain object-left grayscale transition duration-300 group-hover:grayscale-0" />
      ) : (
        <span className="font-brand-ui text-xl font-extrabold tracking-[-0.045em] text-brand-ink">{partner.name}</span>
      )}
    </div>
    <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand-copy">{partner.role}</p>
  </>;

  const className = "group flex h-32 w-64 shrink-0 flex-col justify-between border border-brand-primary/12 bg-white px-6 py-5 transition-colors duration-200 hover:border-brand-accent/70 hover:bg-brand-surface/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

  return partner.href ? <a className={className} href={partner.href} target="_blank" rel="noreferrer">{content}</a> : <div className={className} aria-label={`${partner.name} — ${partner.role}`}>{content}</div>;
}

function PartnerRow({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...partners].reverse() : partners;
  const looped = [...items, ...items];

  return <div className="partner-marquee-row" data-direction={reverse ? "reverse" : "forward"}><div className="partner-marquee-track">{looped.map((partner, index) => <PartnerCard key={`${partner.name}-${index}`} partner={partner} />)}</div></div>;
}

export function B2BPartnerMarquee() {
  return <section className="border-t border-brand-primary/10 bg-brand-surface/45 py-12 md:py-[72px]">
    <div className="mx-auto w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]"><p className="text-xs font-extrabold tracking-[0.15em] text-brand-accent">ĐƠN VỊ ĐỒNG HÀNH</p><h2 className="mt-4 max-w-2xl text-balance font-brand-ui text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Kết nối từ phân phối đến trải nghiệm lưu trú.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-brand-copy">Dải nhận diện đang dùng để thử nghiệm bố cục đối tác. Các tên có nhãn “Demo đối tác” sẽ được thay bằng đơn vị có xác nhận trước khi xuất bản.</p></div>
    <div className="partner-marquee mt-9 space-y-4" aria-label="Danh sách đơn vị đồng hành"><PartnerRow /><PartnerRow reverse /></div>
  </section>;
}
