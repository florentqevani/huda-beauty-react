export default function Footer() {
    return (
        <>
            <section className="footer" id="blogs">
                <div className="footer-box">
                    <h3>Company</h3>
                    <a href="/about">About</a>
                    <a href="/features">Features</a>
                    <a href="/works">Works</a>
                    <a href="/career">Career</a>
                </div>

                <div className="footer-box">
                    <h3>LEGAL</h3>
                    <a href="/terms">Terms and Conditions of Sale</a>
                    <a href="/privacy">Privacy Notice</a>
                    <a href="/do-not-sell">Do Not Sell My Personal Information</a>
                    <a href="/cookies">Cookies Policy</a>
                    <a href="/terms-of-use">Terms of Use</a>
                </div>

                <div className="footer-box">
                    <h3>Resources</h3>
                    <a href="/youtube">Youtube Playlist</a>
                    <a href="/features">Features</a>
                    <a href="/works">Works</a>
                </div>

                <div className="footer-box">
                    <h3>Social</h3>
                    <div className="social">
                        <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <i className="ri-facebook-fill"></i>
                        </a>
                        <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                            <i className="ri-instagram-fill"></i>
                        </a>
                        <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                            <i className="ri-twitter-fill"></i>
                        </a>
                    </div>
                </div>
            </section>

            <div className="copyright">
                <div className="end-text">
                    <p>
                        CopyRight 2025 | This website is linked to www.HudaBeauty.com | All
                        Product Photos belong to this website and all materials are used for
                        educational purposes!
                    </p>
                </div>
                <div className="end-img">
                    <img src="/IMG-20240426-WA0006.jpg" alt="" />
                </div>
            </div>
        </>
    );
}
