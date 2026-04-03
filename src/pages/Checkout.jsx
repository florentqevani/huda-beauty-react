import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createOrderAPI } from '../api/client.js';
import { useNavigate, Link } from 'react-router-dom';

export default function Checkout() {
    const { items, cartTotal, loadCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [shippingName, setShippingName] = useState(user?.name || '');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCity, setShippingCity] = useState('');
    const [shippingZip, setShippingZip] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const shipping = cartTotal >= 100 ? 0 : 10;
    const total = cartTotal + shipping;

    const handleCardNumberChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setCardExpiry(val);
    };

    const handleCvcChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCardCvc(digits);
    };

    if (!user) {
        return (
            <section className="checkout-page">
                <h2>Checkout</h2>
                <p>Please log in to checkout.</p>
            </section>
        );
    }

    if (items.length === 0 && !success) {
        return (
            <section className="checkout-page">
                <h2>Checkout</h2>
                <p>Your cart is empty.</p>
                <Link to="/" className="btn">Continue Shopping</Link>
            </section>
        );
    }

    if (success) {
        return (
            <section className="checkout-page checkout-success">
                <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                </div>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your purchase. Your order is being processed.</p>
                <Link to="/" className="btn">Continue Shopping</Link>
            </section>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const result = await createOrderAPI({
                paymentMethod: paymentMethod === 'apple_pay' ? 'apple_pay' : paymentMethod,
                shippingName,
                shippingAddress,
                shippingCity,
                shippingZip,
            });

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                await loadCart();
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="checkout-page">
            <h2>Checkout</h2>
            <form className="checkout-layout" onSubmit={handleSubmit}>
                <div className="checkout-left">
                    {/* Shipping Info */}
                    <div className="checkout-section">
                        <h3><i className="fas fa-truck"></i> Shipping Information</h3>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={shippingName} onChange={(e) => setShippingName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>ZIP Code</label>
                                <input type="text" value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="checkout-section">
                        <h3><i className="fas fa-credit-card"></i> Payment Method</h3>
                        <div className="payment-methods">
                            <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <i className="fas fa-credit-card"></i>
                                <span>Credit / Debit Card</span>
                            </label>
                            <label className={`payment-option ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                                <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <i className="fab fa-paypal"></i>
                                <span>PayPal</span>
                            </label>
                            <label className={`payment-option ${paymentMethod === 'apple_pay' ? 'active' : ''}`}>
                                <input type="radio" name="payment" value="apple_pay" checked={paymentMethod === 'apple_pay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <i className="fab fa-apple"></i>
                                <span>Apple Pay</span>
                            </label>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="payment-details">
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={handleCardNumberChange} maxLength="19" required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input type="text" inputMode="numeric" placeholder="MM/YY" value={cardExpiry} onChange={handleExpiryChange} maxLength="5" required />
                                    </div>
                                    <div className="form-group">
                                        <label>CVC</label>
                                        <input type="text" inputMode="numeric" placeholder="123" value={cardCvc} onChange={handleCvcChange} maxLength="4" required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'paypal' && (
                            <div className="payment-details">
                                <div className="form-group">
                                    <label>PayPal Email</label>
                                    <input type="email" placeholder="your@email.com" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} required />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'apple_pay' && (
                            <div className="payment-details apple-pay-info">
                                <p><i className="fab fa-apple"></i> You will be redirected to Apple Pay to complete payment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="checkout-right">
                    <div className="checkout-summary">
                        <h3>Order Summary</h3>
                        <div className="checkout-items">
                            {items.map((item) => (
                                <div className="checkout-item" key={item.id}>
                                    <img src={item.image} alt={item.name} />
                                    <div>
                                        <p>{item.name}</p>
                                        <small>Qty: {item.quantity}</small>
                                    </div>
                                    <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        {error && <p className="checkout-error">{error}</p>}
                        <button type="submit" className="btn checkout-btn" disabled={submitting}>
                            {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
