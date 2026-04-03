import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BottomNavbar from "./components/BottomNavbar";
import LoginForm from "./components/LoginForm";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetail from "./pages/ProductDetail";
import { useAuth } from "./context/AuthContext";

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <>
      <Header onLoginClick={() => setLoginOpen(true)} />
      <BottomNavbar />
      <LoginForm active={loginOpen} onClose={() => setLoginOpen(false)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
      </Routes>
      <Footer />
    </>
  );
}

export default App;
