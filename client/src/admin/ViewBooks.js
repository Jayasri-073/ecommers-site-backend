import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import { AdminSidebar } from "./Dashboard";

const ViewBooks = ({ notify }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = () =>
    api.get("/books?limit=48").then(({ data }) => setBooks(data.books)).finally(() => setLoading(false));

  useEffect(() => {
    fetchBooks();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await api.delete(`/books/${id}`);
      notify("Book deleted.", "success");
      fetchBooks();
    } catch (error) {
      notify(error.message, "danger");
    }
  };

  return (
    <section className="admin-layout container-fluid py-4">
      <AdminSidebar />
      <div className="admin-content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="section-title mb-0">View Books</h1>
          <Link className="btn btn-warning fw-semibold" to="/admin/books/add">Add Book</Link>
        </div>
        {loading ? <Loader /> : (
          <div className="table-responsive admin-table">
            <table className="table align-middle">
              <thead>
                <tr><th>Book</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td><strong>{book.title}</strong><div className="small text-muted">{book.author}</div></td>
                    <td>{book.category}</td>
                    <td>${Number(book.price).toFixed(2)}</td>
                    <td>{book.stock}</td>
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-primary me-2" to={`/admin/books/${book._id}/edit`}>Edit</Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(book._id)} type="button">Delete</button>
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

export default ViewBooks;
