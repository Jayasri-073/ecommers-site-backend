import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import api from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <section className="container py-5">
      <h1 className="section-title">Order History</h1>
      {orders.length === 0 ? (
        <div className="empty-state">No orders yet.</div>
      ) : (
        <div className="d-grid gap-3">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="d-flex flex-wrap justify-content-between gap-2">
                <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                <span className="badge text-bg-primary">{order.orderStatus}</span>
              </div>
              <div className="text-muted small mb-3">{new Date(order.createdAt).toLocaleString()}</div>
              {order.books.map((book) => (
                <div className="d-flex justify-content-between border-top py-2" key={book.book}>
                  <span>{book.title} × {book.quantity}</span>
                  <strong>${(book.price * book.quantity).toFixed(2)}</strong>
                </div>
              ))}
              <div className="d-flex justify-content-between pt-3 fs-5">
                <span>Total</span>
                <strong>${order.totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Orders;
