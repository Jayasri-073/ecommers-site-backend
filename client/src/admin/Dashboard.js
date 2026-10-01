import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/books?limit=1"), api.get("/orders"), api.get("/auth/users")]).then(
      ([booksRes, ordersRes, usersRes]) => {
        const orders = ordersRes.data.orders;
        setStats({
          books: booksRes.data.pagination.total,
          orders: orders.length,
          users: usersRes.data.users.length,
          revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
        });
      }
    );
  }, []);

  if (!stats) return <Loader />;

  return (
    <section className="admin-layout container-fluid py-4">
      <AdminSidebar />
      <div className="admin-content">
        <h1 className="section-title">Dashboard</h1>
        <div className="row g-3">
          <DashboardCard label="Books" value={stats.books} />
          <DashboardCard label="Orders" value={stats.orders} />
          <DashboardCard label="Users" value={stats.users} />
          <DashboardCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
        </div>
      </div>
    </section>
  );
};

export const AdminSidebar = () => (
  <aside className="admin-sidebar">
    <Link to="/admin">Dashboard</Link>
    <Link to="/admin/books">Books</Link>
    <Link to="/admin/books/add">Add Book</Link>
    <Link to="/admin/orders">Orders</Link>
    <Link to="/admin/users">Users</Link>
  </aside>
);

const DashboardCard = ({ label, value }) => (
  <div className="col-sm-6 col-xl-3">
    <div className="dashboard-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

export default Dashboard;
