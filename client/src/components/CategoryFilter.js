const CategoryFilter = ({ categories = [], value, onChange }) => (
  <div className="d-flex flex-wrap gap-2">
    <button
      type="button"
      className={`btn btn-sm ${!value ? "btn-warning" : "btn-outline-secondary"}`}
      onClick={() => onChange("")}
    >
      All
    </button>
    {categories.map((category) => (
      <button
        type="button"
        className={`btn btn-sm ${value === category ? "btn-warning" : "btn-outline-secondary"}`}
        key={category}
        onClick={() => onChange(category)}
      >
        {category}
      </button>
    ))}
  </div>
);

export default CategoryFilter;
