"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Email hoặc mật khẩu chưa đúng.");
      setLoading(false);
    } else {
      router.push("/tai-khoan");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-header">
        <Link href="/" className="brand auth-brand" aria-label="Thăng Long trang chủ">
          <span>THĂNG LONG</span>
          <small>Sleep, considered.</small>
        </Link>
      </div>
      <div className="auth-card">
        <p className="eyebrow">TÀI KHOẢN</p>
        <h1>Chào mừng trở lại.</h1>
        <p className="auth-lede">Đăng nhập để xem lịch sử đơn hàng, sổ địa chỉ và hỗ trợ sau mua.</p>
        <form onSubmit={submit}>
          <label>
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="email@example.com" />
          </label>
          <label>
            <span>Mật khẩu</span>
            <input name="password" type="password" required minLength={8} autoComplete="current-password" placeholder="••••••••" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit-btn" disabled={loading}>
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
        <p className="auth-switch">
          Chưa có tài khoản? <Link href="/dang-ky">Đăng ký tài khoản mới</Link>
        </p>
      </div>
    </main>
  );
}
