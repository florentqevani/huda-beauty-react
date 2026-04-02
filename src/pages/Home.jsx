import Hero from '../components/Hero.jsx';
import IconsContainer from '../components/IconsContainer.jsx';
import AllProducts from '../components/AllProducts.jsx';
import Feature from '../components/Feature.jsx';
import BestSellers from '../components/BestSellers.jsx';
import Newsletter from '../components/Newsletter.jsx';

export default function Home() {
    return (
        <>
            <Hero />
            <IconsContainer />
            <AllProducts />
            <Feature />
            <BestSellers />
            <Newsletter />
        </>
    );
}
