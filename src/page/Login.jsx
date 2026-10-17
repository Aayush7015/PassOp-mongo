import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import EyeToggle from "../components/EyeToggle";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [visible, setVisible] = useState(false), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { const data = await api("/auth/login", { method: "POST", body: JSON.stringify(form) }); sessionStorage.setItem("passopToken", data.token); navigate("/"); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <main className="auth-background flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-10"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-7 shadow-2xl shadow-green-950/10 backdrop-blur sm:p-9"><div className="mb-8 text-center"><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-green-700 text-2xl text-white shadow-lg shadow-green-700/30">⌁</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1><p className="mt-2 text-sm text-slate-600">Sign in to manage your saved credentials.</p></div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">Email address</label><input id="email" type="email" name="email" autoComplete="email" placeholder="you@example.com" className="auth-input mb-5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">Password</label><div className="relative"><input id="password" type={visible ? "text" : "password"} name="password" autoComplete="current-password" placeholder="Enter your password" className="auth-input pr-12" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><EyeToggle visible={visible} onClick={() => setVisible(!visible)} /></div>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<button disabled={loading} className="mt-6 w-full rounded-xl bg-green-700 py-3 font-semibold text-white shadow-lg shadow-green-700/25 transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in..." : "Login securely"}</button><p className="mt-6 text-center text-sm text-slate-600">New to PassOP? <Link className="font-semibold text-green-700 hover:text-green-900" to="/register">Create an account</Link></p></form></main>;
}
