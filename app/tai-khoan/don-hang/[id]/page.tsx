import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountOrder } from "@/lib/account";
import { AccountOrderExperience } from "@/components/account-order-experience";

export const dynamic = "force-dynamic";

import { isUiShowcaseMode, getShowcaseOrder } from "@/lib/ui-showcase";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const showcase = isUiShowcaseMode() && !session?.user?.id;
  const showcaseOrder = showcase ? getShowcaseOrder(id) : null;

  if (!session?.user?.id && !showcase) {
    return (
      <main className="account-page container">
        <h1>Đăng nhập để xem đơn hàng.</h1>
        <Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link>
      </main>
    );
  }
  const prisma = getPrisma();
  const order = (showcaseOrder ?? (prisma && session?.user?.id
    ? await getAccountOrder(prisma, session.user.id, id).catch(() => null)
    : null)) as any;

  if (!order) notFound();
  return <AccountOrderExperience order={JSON.parse(JSON.stringify(order))} />;
}
