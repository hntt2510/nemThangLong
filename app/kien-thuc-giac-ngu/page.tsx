import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { sleepJournalPosts } from "@/lib/sleep-journal";
import { getSiteSettings } from "@/lib/products";

export const metadata = { title: "Blog Thăng Long - Nệm Thăng Long", description: "Những hướng dẫn ngắn giúp bạn chọn, sử dụng và bảo quản nệm dễ hơn.", alternates: { canonical: "/kien-thuc-giac-ngu" } };

export default async function SleepJournalPage() {
  const settings = await getSiteSettings();
  return <><SiteHeader solid /><main className="container journal-page"><div className="journal-page-intro"><p className="eyebrow">BLOG THĂNG LONG</p><h1>Những điều cần biết để chọn nệm dễ hơn.</h1><p>Hướng dẫn ngắn về kích thước, chăm sóc và cách cân nhắc một lựa chọn phù hợp với phòng ngủ của bạn.</p></div><div className="journal-page-grid">{sleepJournalPosts.map((post) => <Link key={post.slug} href={`/kien-thuc-giac-ngu/${post.slug}` as never}><span><Image src={post.image} alt="" fill sizes="(max-width: 860px) 100vw, 33vw" /></span><h2>{post.title}</h2><p>{post.excerpt}</p></Link>)}</div></main><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
