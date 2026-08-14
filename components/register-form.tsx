"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); const data = new FormData(event.currentTarget); const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: data.get("name"), email: data.get("email"), password: data.get("password") }) }); const result = await response.json(); if (!response.ok) { setError(result.error ?? "Không thể đăng ký."); setLoading(false); return; } router.push("/dang-nhap"); }
  return <form onSubmit={submit}><label>Họ và tên<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><label>Mật khẩu<input name="password" type="password" minLength={8} required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary" disabled={loading}>{loading ? "Đang tạo…" : "Tạo tài khoản"}</button><p className="auth-switch">Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link></p></form>;
}
