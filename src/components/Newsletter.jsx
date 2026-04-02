export default function Newsletter() {
    return (
        <section className="newsletter">
            <div className="newsletter-content">
                <div className="newsletter-text">
                    <h2>Get On the List!</h2>
                    <p>Sign up with your email address to receive updates.</p>
                </div>
                <form action="" onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Your email..." required />
                    <input type="submit" value="Subscribe" className="btnnn" />
                </form>
            </div>
        </section>
    );
}
