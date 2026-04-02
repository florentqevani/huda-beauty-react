const features = [
    {
        icon: "ri-bank-card-fill",
        title: "Cash on Delivery",
        text: "Enjoy Hassle-Free Shopping with Cash on Delivery! Pay only when your order arrives at your doorstep. Shop with confidence and convenience—no online payment required!",
    },
    {
        icon: "ri-truck-fill",
        title: "Free Shipping",
        text: "Get Free Shipping on All Orders! No extra charges—just great products delivered straight to your door at no cost. Shop more, worry less!",
    },
    {
        icon: "ri-customer-service-fill",
        title: "10 days return",
        text: "Shop with Confidence – 10-Day Easy Returns! Not satisfied with your purchase? No problem! Return it within 10 days for a hassle-free refund",
    },
];

export default function Feature() {
    return (
        <section className="feature" id="feature">
            <div className="feature-content">
                {features.map((f) => (
                    <div className="box" key={f.title}>
                        <div className="f-icon">
                            <i className={f.icon}></i>
                        </div>
                        <div className="f-text">
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
