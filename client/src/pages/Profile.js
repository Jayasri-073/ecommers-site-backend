import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = ({ notify }) => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    username: user.username,
    phone: user.phone || "",
    address: user.address || { street: "", city: "", state: "", zipCode: "", country: "" }
  });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await updateProfile(form);
      notify("Profile updated.", "success");
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  const setAddress = (field, value) => setForm({ ...form, address: { ...form.address, [field]: value } });

  return (
    <section className="container py-5">
      <form className="form-panel mx-auto profile-panel" onSubmit={submit}>
        <h1 className="section-title">Profile</h1>
        <label className="form-label">Username</label>
        <input className="form-control mb-3" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <label className="form-label">Phone</label>
        <input className="form-control mb-3" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="row g-3">
          {["street", "city", "state", "zipCode", "country"].map((field) => (
            <div className="col-md-6" key={field}>
              <label className="form-label text-capitalize">{field === "zipCode" ? "ZIP Code" : field}</label>
              <input className="form-control" value={form.address[field] || ""} onChange={(e) => setAddress(field, e.target.value)} />
            </div>
          ))}
        </div>
        <button className="btn btn-primary mt-4" type="submit">Save Profile</button>
      </form>
    </section>
  );
};

export default Profile;
