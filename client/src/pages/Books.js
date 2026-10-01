import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import CategoryFilter from "../components/CategoryFilter";
import Loader from "../components/Loader";
import SearchBar from "../components/SearchBar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Books = ({ notify }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const fetchBooks = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8, sort });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const { data } = await api.get(`/books?${params.toString()}`);
      const payload = data ?? {};
      const nextBooks = Array.isArray(payload.books)
        ? payload.books
        : Array.isArray(payload)
          ? payload
          : [];
      setBooks(nextBooks);
      setCategories(Array.isArray(payload.categories) ? payload.categories : []);
      setPagination(payload.pagination ?? { page: 1, pages: 1, total: 0 });
    } catch (error) {
      notify(error.message, "danger");
      setBooks([]);
      setCategories([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(1);
  }, [category, sort]);

  const handleAdd = async (bookId) => {
    if (!isAuthenticated) return notify("Please log in to add books to your cart.", "warning");
    await addToCart(bookId);
    notify("Book added to cart.", "success");
  };

  const safeBooks = Array.isArray(books) ? books : [];

  return (
    <section className="container py-5">
      <div className="catalog-toolbar mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={(event) => {
            event.preventDefault();
            fetchBooks(1);
          }}
        />
        <select
          className="form-select catalog-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort books"
        >
          <option value="newest">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
      </div>
      <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="row g-4 mt-1">
            {safeBooks.map((book) => (
              <div className="col-sm-6 col-lg-3" key={book._id}>
                <BookCard book={book} onAdd={handleAdd} />
              </div>
            ))}
            {safeBooks.length === 0 && <div className="alert alert-light border">No books found.</div>}
          </div>
          <nav className="mt-4" aria-label="Book pagination">
            <ul className="pagination justify-content-center">
              {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((page) => (
                <li className={`page-item ${pagination.page === page ? "active" : ""}`} key={page}>
                  <button className="page-link" onClick={() => fetchBooks(page)} type="button">
                    {page}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </section>
  );
};

export default Books;
