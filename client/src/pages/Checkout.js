import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Checkout = ({ notify }) => {
  const { user } = useAuth();
  const { cart, total, fetchCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.username || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    country: user?.address?.country || ""
  });

  const setField = (field, value) => setShippingAddress({ ...shippingAddress, [field]: value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/orders", { shippingAddress, paymentMethod });
      await fetchCart();
      notify("Order placed successfully.", "success");
      navigate("/orders");
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  return (
    <section className="container py-5">
      <h1 className="section-title">Checkout</h1>
      <form className="row g-4" onSubmit={submit}>
        <div className="col-lg-8">
          <div className="form-panel">
            <h2 className="h4 fw-bold mb-3">Shipping Address</h2>
            <div className="row g-3">
              {[
                ["fullName", "Full Name"],
                ["phone", "Phone"],
                ["street", "Street"],
                ["city", "City"],
                ["state", "State"],
                ["zipCode", "ZIP Code"],
                ["country", "Country"]
              ].map(([field, label]) => (
                <div className="col-md-6" key={field}>
                  <label className="form-label">{label}</label>
                  <input className="form-control" required value={shippingAddress[field]} onChange={(e) => setField(field, e.target.value)} />
                </div>
              ))}
            </div>
            <h2 className="h4 fw-bold mt-4 mb-3">Payment</h2>
            <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option>Cash on Delivery</option>
              <option>Card</option>
              <option>UPI</option>
              <option>Net Banking</option>
            </select>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="summary-panel">
            <h2 className="h4 fw-bold">Review Order</h2>
            {cart.items.map((item) => (
              <div className="d-flex justify-content-between small py-2 border-bottom" key={item._id}>
                <span>{item.book.title} × {item.quantity}</span>
                <strong>${(item.book.price * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
            <div className="d-flex justify-content-between my-3 fs-5">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button className="btn btn-warning w-100 fw-semibold" disabled={cart.items.length === 0} type="submit">
              Place Order
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;
