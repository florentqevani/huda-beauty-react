const iconItems = [
    {
        icon: "fas fa-paper-plane",
        title: "Free Shipping",
        text: "Order over 100$",
    },
    {
        icon: "fas fa-lock",
        title: "Secure Payment",
        text: "100% Secure Payment",
    },
    {
        icon: "fas fa-redo-alt",
        title: "Easy Returns",
        text: "10 Days Returns",
    },
    {
        icon: "fas fa-headset",
        title: "24/7 Support",
        text: "Call us Anytime",
    },
];

export default function IconsContainer() {
    return (
        <section className="icons-contanier">
            {iconItems.map((item, i) => (
                <div className="icons" key={i}>
                    <i className={item.icon}></i>
                    <div className="content">
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                    </div>
                </div>
            ))}
        </section>
    );
}
