import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header({ onLoginClick }) {
    const [stickyNav, setStickyNav] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setStickyNav(window.scrollY > 80);
        };
        window.addEventListener("scroll", handleScroll);
        setStickyNav(window.scrollY > 80);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="header">
            <div className="header-1">
                <Link to="/" style={{ textDecoration: 'none' }} onClick={() => window.scrollTo(0, 0)}><span className="logo">Huda Beauty</span></Link>
                <div className="icons">
                    <Link to="/cart" aria-label="Cart" style={{ position: 'relative', textDecoration: 'none' }}>
                        <span className="fas fa-shopping-cart"></span>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" className="fas fa-tachometer-alt" aria-label="Admin Dashboard" title="Admin Dashboard"></Link>
                            )}
                            <Link to="/orders" className="fas fa-box" aria-label="My Orders" title="My Orders"></Link>
                            <button
                                className="fas fa-sign-out-alt"
                                aria-label="Logout"
                                title={`Logout (${user.name})`}
                                onClick={async () => {
                                    await logout();
                                    navigate('/');
                                    window.scrollTo(0, 0);
                                }}
                            ></button>
                        </>
                    ) : (
                        <button
                            id="Login-btn"
                            className="fas fa-user"
                            aria-label="Login"
                            onClick={onLoginClick}
                        ></button>
                    )}
                </div>
            </div>

            <div className={`header-2${stickyNav ? " active" : ""}`}>
                <nav className="navbar">
                    <Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link>
                    <a href="/#feature">Feature</a>
                    <a href="/#Arrivals">Arrivals</a>
                    <a href="/#Reviews">Best Sellers</a>
                    <a href="/#blogs">Contact</a>
                    {isAdmin && <Link to="/admin">Dashboard</Link>}
                </nav>
            </div>
        </header>
    );
}

Header.propTypes = {
    onLoginClick: PropTypes.func.isRequired,
};
