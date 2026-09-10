import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSleepJournalPost, sleepJournalPosts } from "@/lib/sleep-journal";
import { getSiteSettings } from "@/lib/products";

export function generateStaticParams() { return sleepJournalPosts.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = getSleepJournalPost((await params).slug);
  if (!post) return {};
  return { title: post.title + " - Blog Thăng Long", description: post.excerpt, alternates: { canonical: "/kien-thuc-giac-ngu/" + post.slug } };
}

export default async function SleepJournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getSleepJournalPost((await params).slug);
  if (!post) notFound();
  const settings = await getSiteSettings();
  const related = sleepJournalPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const contactHref = settings?.contactPhone ? "tel:" + settings.contactPhone : settings?.contactEmail ? "mailto:" + settings.contactEmail : "/lien-he";
  return <><SiteHeader solid /><main className="container journal-article"><nav className="journal-breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><a href="/kien-thuc-giac-ngu">Blog</a></nav><p className="eyebrow">BLOG THĂNG LONG</p><h1>{post.title}</h1><div className="journal-article-image"><Image src={post.image} alt="" fill priority sizes="(max-width: 860px) 100vw, 720px" /></div><div className="journal-article-body">{post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><section className="journal-related"><h2>Bài viết khác</h2><div>{related.map((item) => <a key={item.slug} href={`/kien-thuc-giac-ngu/${item.slug}`}>{item.title} <span aria-hidden="true">→</span></a>)}</div></section><section className="journal-consult"><div><h2>Cần tư vấn thêm?</h2><p>Liên hệ để trao đổi theo nhu cầu và không gian phòng ngủ của bạn.</p></div><a href={contactHref} className="button button-primary">Liên hệ tư vấn <span aria-hidden="true">→</span></a></section></main><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
