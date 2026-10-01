import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import api, { FALLBACK_BOOK_IMAGE, getBookImageUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const BookDetails = ({ notify }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const fetchBook = async () => {
    const { data } = await api.get(`/books/${id}`);
    setBook(data.book);
  };

  useEffect(() => {
    fetchBook().catch((error) => notify(error.message, "danger")).finally(() => setLoading(false));
  }, [id]);

  const add = async () => {
    if (!isAuthenticated) return notify("Please log in to add books to your cart.", "warning");
    await addToCart(book._id, quantity);
    notify("Book added to cart.", "success");
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) return notify("Please log in to review books.", "warning");
    try {
      const { data } = await api.post(`/books/${id}/reviews`, review);
      setBook(data.book);
      setReview({ rating: 5, comment: "" });
      notify("Review saved.", "success");
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  if (loading) return <Loader />;
  if (!book) return <div className="container py-5 alert alert-light border">Book not found.</div>;

  const imageUrl = getBookImageUrl(book);

  return (
    <section className="container py-5">
      <div className="row g-5">
        <div className="col-md-5">
          <img
            className="details-cover shadow-sm"
            src={imageUrl}
            alt={book.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_BOOK_IMAGE;
            }}
          />
        </div>
        <div className="col-md-7">
          <span className="badge text-bg-warning mb-3">{book.category}</span>
          <h1 className="fw-bold">{book.title}</h1>
          <p className="text-muted">by {book.author}</p>
          <div className="h4 text-warning fw-bold">★ {Number(book.rating || 0).toFixed(1)}</div>
          <p className="lead text-secondary">{book.description}</p>
          <dl className="row small">
            <dt className="col-sm-3">Publisher</dt>
            <dd className="col-sm-9">{book.publisher}</dd>
            <dt className="col-sm-3">Language</dt>
            <dd className="col-sm-9">{book.language}</dd>
            <dt className="col-sm-3">ISBN</dt>
            <dd className="col-sm-9">{book.isbn}</dd>
          </dl>
          <div className="d-flex align-items-center gap-3 my-4">
            <span className="display-6 fw-bold">${Number(book.price).toFixed(2)}</span>
            <span className={book.stock > 0 ? "text-success" : "text-danger"}>
              {book.stock > 0 ? `${book.stock} available` : "Sold out"}
            </span>
          </div>
          <div className="d-flex gap-2 mb-5">
            <input
              className="form-control qty-input"
              type="number"
              min="1"
              max={book.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <button className="btn btn-primary px-4" disabled={book.stock <= 0} onClick={add} type="button">
              Add to Cart
            </button>
          </div>
          <form className="review-form" onSubmit={submitReview}>
            <h2 className="h5 fw-bold">Write a Review</h2>
            <select className="form-select mb-2" value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} stars</option>
              ))}
            </select>
            <textarea className="form-control mb-2" rows="3" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
            <button className="btn btn-outline-primary" type="submit">Submit Review</button>
          </form>
        </div>
      </div>
      <div className="mt-5">
        <h2 className="h4 fw-bold">Reviews</h2>
        {book.reviews.length === 0 ? (
          <p className="text-muted">No reviews yet.</p>
        ) : (
          <div className="row g-3">
            {book.reviews.map((item) => (
              <div className="col-md-6" key={item._id}>
                <div className="review-card">
                  <div className="fw-bold">{item.username}</div>
                  <div className="text-warning small">★ {item.rating}</div>
                  <p className="mb-0 text-secondary">{item.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BookDetails;
