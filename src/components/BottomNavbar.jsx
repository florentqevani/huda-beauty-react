export default function BottomNavbar() {
    return (
        <nav className="bottom-navbar">
            <a href="#home" className="fas fa-home" aria-label="Home" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}><span className="sr-only">Home</span></a>
            <a href="#feature" className="fas fa-list" aria-label="Features"><span className="sr-only">Features</span></a>
            <a href="#Arrivals" className="fas fa-tags" aria-label="Arrivals"><span className="sr-only">Arrivals</span></a>
            <a href="#Reviews" className="fas fa-comment" aria-label="Reviews"><span className="sr-only">Reviews</span></a>
            <a href="#blogs" className="fas fa-blog" aria-label="Blog"><span className="sr-only">Blog</span></a>
        </nav>
    );
}
