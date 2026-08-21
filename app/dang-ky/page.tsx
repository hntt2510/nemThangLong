import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function SignUpPage() {
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
        <h1>Tạo không gian của bạn.</h1>
        <p className="auth-lede">Tạo tài khoản để lưu địa chỉ giao hàng và theo dõi các đơn hàng nệm Thăng Long.</p>
        <RegisterForm />
      </div>
    </main>
  );
}
