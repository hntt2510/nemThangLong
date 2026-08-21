"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Không thể đăng ký.");
      setLoading(false);
      return;
    }
    router.push("/dang-nhap");
  }

  return (
    <form onSubmit={submit}>
      <label>
        <span>Họ và tên <b aria-hidden="true">*</b></span>
        <input name="name" required autoComplete="name" placeholder="Nguyễn Văn A" />
      </label>
      <label>
        <span>Email <b aria-hidden="true">*</b></span>
        <input name="email" type="email" required autoComplete="email" placeholder="email@example.com" />
      </label>
      <label>
        <span>Mật khẩu (tối thiểu 8 ký tự) <b aria-hidden="true">*</b></span>
        <input name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="••••••••" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary auth-submit-btn" disabled={loading}>
        {loading ? "Đang tạo…" : "Tạo tài khoản"}
      </button>
      <p className="auth-switch">
        Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
      </p>
    </form>
  );
}
