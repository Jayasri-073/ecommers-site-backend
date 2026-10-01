import { useEffect, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";
import { AdminSidebar } from "./Dashboard";

const AdminOrders = ({ notify }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => api.get("/orders").then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrder = async (id, field, value) => {
    try {
      await api.put(`/orders/${id}`, { [field]: value });
      notify("Order updated.", "success");
      fetchOrders();
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  return (
    <section className="admin-layout container-fluid py-4">
      <AdminSidebar />
      <div className="admin-content">
        <h1 className="section-title">Manage Orders</h1>
        {loading ? <Loader /> : (
          <div className="table-responsive admin-table">
            <table className="table align-middle">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>#{order._id.slice(-8).toUpperCase()}</strong><div className="small text-muted">{new Date(order.createdAt).toLocaleDateString()}</div></td>
                    <td>{order.user?.username}<div className="small text-muted">{order.user?.email}</div></td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <select className="form-select form-select-sm" value={order.paymentStatus} onChange={(e) => updateOrder(order._id, "paymentStatus", e.target.value)}>
                        {["Pending", "Paid", "Failed", "Refunded"].map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="form-select form-select-sm" value={order.orderStatus} onChange={(e) => updateOrder(order._id, "orderStatus", e.target.value)}>
                        {["Processing", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => <option key={status}>{status}</option>)}
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

export default AdminOrders;
