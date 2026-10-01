const SearchBar = ({ value, onChange, onSubmit }) => (
  <form className="search-shell" onSubmit={onSubmit}>
    <input
      className="form-control"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search by title, author, or ISBN"
      aria-label="Search books"
    />
    <button className="btn btn-warning fw-semibold px-4" type="submit">
      Search
    </button>
  </form>
);

export default SearchBar;
