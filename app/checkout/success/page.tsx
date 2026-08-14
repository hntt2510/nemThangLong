import { redirect } from "next/navigation";

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  redirect(params.token ? `/checkout/result?token=${encodeURIComponent(params.token)}` as never : "/checkout/result" as never);
}
