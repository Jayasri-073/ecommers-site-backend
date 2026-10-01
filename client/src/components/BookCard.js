import { Link } from "react-router-dom";
import { FALLBACK_BOOK_IMAGE, getBookImageUrl } from "../services/api";

const BookCard = ({ book, onAdd }) => {
  const imageUrl = getBookImageUrl(book);

  return (
    <div className="card book-card h-100 border-0 shadow-sm">
      <Link to={`/books/${book._id}`} className="book-cover-link">
        <img
          src={imageUrl}
          className="book-cover"
          alt={book.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_BOOK_IMAGE;
          }}
        />
    </Link>
    <div className="card-body d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <span className="badge text-bg-light border">{book.category}</span>
        <span className="small text-warning fw-bold">★ {Number(book.rating || 0).toFixed(1)}</span>
      </div>
      <h5 className="card-title line-clamp-2">{book.title}</h5>
      <p className="text-muted small mb-2">by {book.author}</p>
      <p className="card-text text-secondary small line-clamp-3">{book.description}</p>
      <div className="mt-auto">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="price">${Number(book.price).toFixed(2)}</span>
          <span className={`small ${book.stock > 0 ? "text-success" : "text-danger"}`}>
            {book.stock > 0 ? `${book.stock} in stock` : "Sold out"}
          </span>
        </div>
        <div className="d-grid gap-2">
          <button
            className="btn btn-primary"
            disabled={book.stock <= 0}
            onClick={() => onAdd(book._id)}
            type="button"
          >
            Add to Cart
          </button>
          <Link className="btn btn-outline-primary" to={`/books/${book._id}`}>
            View Details
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BookCard;
