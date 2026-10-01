const BookForm = ({ form, setForm, onSubmit, submitting, submitLabel }) => {
  const fields = [
    ["title", "Title", "text"],
    ["author", "Author", "text"],
    ["category", "Category", "text"],
    ["price", "Price", "number"],
    ["stock", "Stock", "number"],
    ["publisher", "Publisher", "text"],
    ["language", "Language", "text"],
    ["isbn", "ISBN", "text"]
  ];

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <form className="form-panel" onSubmit={onSubmit}>
      <div className="row g-3">
        {fields.map(([field, label, type]) => (
          <div className="col-md-6" key={field}>
            <label className="form-label">{label}</label>
            <input
              className="form-control"
              type={type}
              required
              step={field === "price" ? "0.01" : undefined}
              min={type === "number" ? "0" : undefined}
              value={form[field]}
              onChange={(event) => update(field, event.target.value)}
            />
          </div>
        ))}
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea className="form-control" required minLength="20" rows="4" value={form.description} onChange={(event) => update("description", event.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Image URL</label>
          <input className="form-control" value={form.image} onChange={(event) => update("image", event.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Upload Image</label>
          <input className="form-control" type="file" accept="image/*" onChange={(event) => update("imageFile", event.target.files[0])} />
        </div>
      </div>
      <button className="btn btn-primary mt-4" disabled={submitting} type="submit">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export const initialBookForm = {
  title: "",
  author: "",
  category: "",
  description: "",
  price: "",
  image: "",
  imageFile: null,
  stock: "",
  publisher: "",
  language: "English",
  isbn: ""
};

export const toBookFormData = (form) => {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (key === "imageFile") {
      if (value) data.append("image", value);
    } else if (value !== undefined && value !== null) {
      data.append(key, value);
    }
  });
  return data;
};

export default BookForm;
