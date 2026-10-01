import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import { AdminSidebar } from "./Dashboard";
import BookForm, { initialBookForm, toBookFormData } from "./BookForm";

const EditBook = ({ notify }) => {
  const { id } = useParams();
  const [form, setForm] = useState(initialBookForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/books/${id}`)
      .then(({ data }) => setForm({ ...initialBookForm, ...data.book, imageFile: null }))
      .catch((error) => notify(error.message, "danger"))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/books/${id}`, toBookFormData(form), { headers: { "Content-Type": "multipart/form-data" } });
      notify("Book updated.", "success");
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
        <h1 className="section-title">Edit Book</h1>
        {loading ? <Loader /> : <BookForm form={form} setForm={setForm} onSubmit={submit} submitting={submitting} submitLabel="Save Changes" />}
      </div>
    </section>
  );
};

export default EditBook;
