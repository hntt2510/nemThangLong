"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter(); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false }); if (result?.error) setError("Email hoặc mật khẩu chưa đúng."); else router.push("/tai-khoan"); }
  return <main className="auth-page"><Link href="/nem/luxury" className="brand auth-brand">THĂNG LONG</Link><div className="auth-card"><p className="eyebrow">TÀI KHOẢN</p><h1>Chào mừng trở lại.</h1><form onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Mật khẩu<input name="password" type="password" required minLength={8} autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary">Đăng nhập</button></form><p className="auth-switch">Chưa có tài khoản? <Link href="/dang-ky">Đăng ký</Link></p></div></main>;
}
