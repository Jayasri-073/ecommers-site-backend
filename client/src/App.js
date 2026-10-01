import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Dashboard from "./admin/Dashboard";
import AddBook from "./admin/AddBook";
import EditBook from "./admin/EditBook";
import ViewBooks from "./admin/ViewBooks";
import AdminOrders from "./admin/Orders";
import Users from "./admin/Users";
import "./admin/Dashboard.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
};

const App = () => {
  const [toast, setToast] = useState(null);

  const notify = (message, type = "primary") => {
    setToast({ message, type });
    window.clearTimeout(window.bookverseToastTimer);
    window.bookverseToastTimer = window.setTimeout(() => setToast(null), 3500);
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home notify={notify} />} />
            <Route path="/books" element={<Books notify={notify} />} />
            <Route path="/books/:id" element={<BookDetails notify={notify} />} />
            <Route path="/login" element={<Login notify={notify} />} />
            <Route path="/register" element={<Register notify={notify} />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart notify={notify} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout notify={notify} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile notify={notify} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <AdminRoute>
                  <ViewBooks notify={notify} />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books/add"
              element={
                <AdminRoute>
                  <AddBook notify={notify} />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books/:id/edit"
              element={
                <AdminRoute>
                  <EditBook notify={notify} />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders notify={notify} />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Users notify={notify} />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </BrowserRouter>
  );
};

export default App;
