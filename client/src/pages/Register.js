import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = ({ notify }) => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "" }
  });

  const setAddress = (field, value) =>
    setForm((current) => ({ ...current, address: { ...current.address, [field]: value } }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await register(form);
      notify(result?.message || "Account created successfully.", "success");
      navigate("/");
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card wide" onSubmit={submit}>
        <h1 className="h3 fw-bold mb-3">Create Account</h1>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Username</label>
            <input className="form-control" required minLength="3" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          {["street", "city", "state", "zipCode", "country"].map((field) => (
            <div className="col-md-6" key={field}>
              <label className="form-label text-capitalize">{field === "zipCode" ? "ZIP Code" : field}</label>
              <input className="form-control" value={form.address[field]} onChange={(e) => setAddress(field, e.target.value)} />
            </div>
          ))}
        </div>
        <button className="btn btn-primary w-100 mt-4" disabled={loading} type="submit">
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
};

export default Register;
