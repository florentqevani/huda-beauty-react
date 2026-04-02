import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
    const { items, updateQuantity, removeItem, cartTotal, loading } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <section className="cart-page">
                <h2>Shopping Cart</h2>
                <p className="cart-empty">Please log in to view your cart.</p>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="cart-page">
                <h2>Shopping Cart</h2>
                <p>Loading...</p>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="cart-page">
                <h2>Shopping Cart</h2>
                <p className="cart-empty">Your cart is empty.</p>
                <Link to="/" className="btn">Continue Shopping</Link>
            </section>
        );
    }

    return (
        <section className="cart-page">
            <h2>Shopping Cart</h2>
            <div className="cart-layout">
                <div className="cart-items">
                    {items.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <img src={item.image} alt={item.name} className="cart-item-img" />
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p className="cart-item-price">${parseFloat(item.price).toFixed(2)}</p>
                                <div className="cart-item-qty">
                                    <button
                                        onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>
                            </div>
                            <div className="cart-item-subtotal">
                                <p>${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                <button className="btn-remove" onClick={() => removeItem(item.id)}>
                                    <i className="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>{cartTotal >= 100 ? 'Free' : '$10.00'}</span>
                    </div>
                    <div className="summary-row summary-total">
                        <span>Total</span>
                        <span>${(cartTotal + (cartTotal >= 100 ? 0 : 10)).toFixed(2)}</span>
                    </div>
                    <button className="btn checkout-btn" onClick={() => navigate('/checkout')}>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </section>
    );
}
