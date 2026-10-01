import { useEffect, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";
import { AdminSidebar } from "./Dashboard";

const Users = ({ notify }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => api.get("/auth/users").then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.put(`/auth/users/${id}/role`, { role });
      notify("User role updated.", "success");
      fetchUsers();
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  return (
    <section className="admin-layout container-fluid py-4">
      <AdminSidebar />
      <div className="admin-content">
        <h1 className="section-title">Manage Users</h1>
        {loading ? <Loader /> : (
          <div className="table-responsive admin-table">
            <table className="table align-middle">
              <thead>
                <tr><th>User</th><th>Phone</th><th>Joined</th><th>Role</th></tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td><strong>{user.username}</strong><div className="small text-muted">{user.email}</div></td>
                    <td>{user.phone || "Not set"}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select className="form-select form-select-sm role-select" value={user.role} onChange={(e) => updateRole(user._id, e.target.value)}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Users;
