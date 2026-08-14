import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function SignUpPage() { return <main className="auth-page"><Link href="/nem/luxury" className="brand auth-brand">THĂNG LONG</Link><div className="auth-card"><p className="eyebrow">TÀI KHOẢN</p><h1>Tạo không gian của bạn.</h1><RegisterForm /></div></main>; }
