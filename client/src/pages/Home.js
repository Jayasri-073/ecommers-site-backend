import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import BookCard from "../components/BookCard";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Home = ({ notify }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api
      .get("/books?limit=4&sort=rating")
      .then(({ data }) => setBooks(data.books))
      .catch((error) => notify(error.message, "danger"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (bookId) => {
    if (!isAuthenticated) return notify("Please log in to add books to your cart.", "warning");
    await addToCart(bookId);
    notify("Book added to cart.", "success");
  };

  return (
    <>
      <section className="hero-section">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="eyebrow">Online bookstore</span>
              <h1 className="display-4 fw-bold text-white mb-3">BookVerse</h1>
              <p className="lead text-white-75 mb-4">
                Discover thoughtful reads, compare editions, and check out quickly with a polished
                bookstore experience built for every screen.
              </p>
              <Link className="btn btn-warning btn-lg fw-semibold" to="/books">
                Browse Books
              </Link>
            </div>
            <div className="col-lg-5">
              <div className="hero-stack">
                <img
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80"
                  alt="Bookstore shelves"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="section-title mb-0">Top Picks</h2>
          <Link className="btn btn-outline-primary" to="/books">
            View All
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="row g-4">
            {books.map((book) => (
              <div className="col-sm-6 col-lg-3" key={book._id}>
                <BookCard book={book} onAdd={handleAdd} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;
