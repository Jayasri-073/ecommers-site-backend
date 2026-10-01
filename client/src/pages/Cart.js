import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { FALLBACK_BOOK_IMAGE, getBookImageUrl } from "../services/api";

const Cart = ({ notify }) => {
  const { cart, loading, total, updateQuantity, removeFromCart } = useCart();

  const update = async (itemId, quantity) => {
    try {
      await updateQuantity(itemId, quantity);
      notify("Cart updated.", "success");
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  const remove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      notify("Item removed.", "success");
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  if (loading) return <Loader />;

  return (
    <section className="container py-5">
      <h1 className="section-title">Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link className="btn btn-primary" to="/books">Browse Books</Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {cart.items.map((item) => (
              <div className="cart-row" key={item._id}>
                <img
                  src={getBookImageUrl(item.book)}
                  alt={item.book.title}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_BOOK_IMAGE;
                  }}
                />
                <div className="flex-grow-1">
                  <h2 className="h5 fw-bold mb-1">{item.book.title}</h2>
                  <p className="text-muted mb-2">{item.book.author}</p>
                  <div className="fw-bold">${Number(item.book.price).toFixed(2)}</div>
                </div>
                <input className="form-control qty-input" type="number" min="1" max={item.book.stock} value={item.quantity} onChange={(e) => update(item._id, Number(e.target.value))} />
                <button className="btn btn-outline-danger" onClick={() => remove(item._id)} type="button">Remove</button>
              </div>
            ))}
          </div>
          <div className="col-lg-4">
            <div className="summary-panel">
              <h2 className="h4 fw-bold">Order Summary</h2>
              <div className="d-flex justify-content-between my-3">
                <span>Subtotal</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <Link className="btn btn-warning w-100 fw-semibold" to="/checkout">Proceed to Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
