import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AdminSidebar } from "./Dashboard";
import BookForm, { initialBookForm, toBookFormData } from "./BookForm";

const AddBook = ({ notify }) => {
  const [form, setForm] = useState(initialBookForm);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/books", toBookFormData(form), { headers: { "Content-Type": "multipart/form-data" } });
      notify("Book added.", "success");
      navigate("/admin/books");
    } catch (error) {
      notify(error.message, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-layout container-fluid py-4">
      <AdminSidebar />
      <div className="admin-content">
        <h1 className="section-title">Add Book</h1>
        <BookForm form={form} setForm={setForm} onSubmit={submit} submitting={submitting} submitLabel="Add Book" />
      </div>
    </section>
  );
};

export default AddBook;
