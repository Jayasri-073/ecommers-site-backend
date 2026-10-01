import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = ({ notify }) => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      notify("Welcome back.", "success");
      navigate("/");
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="h3 fw-bold mb-3">Login</h1>
        <label className="form-label">Email</label>
        <input className="form-control mb-3" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="form-label">Password</label>
        <input className="form-control mb-4" type="password" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-primary w-100" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-center mt-3 mb-0">
          New to BookVerse? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
