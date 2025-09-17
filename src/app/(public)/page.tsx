import About from '@/components/public/About';
import Footer from '@/components/public/Footer';
import Header from '@/components/public/Header';
import Hero from '@/components/public/Hero';
import MapSection from '@/components/public/MapSection';
import Services from '@/components/public/Services';
import Testimonials from '@/components/public/Testimonials';

export default function HomePage() {
	return (
		<div className="min-h-screen">
			<Header />
			<main>
				<Hero />
				<About />
				<Services />
				<Testimonials />
				<MapSection />
			</main>
			<Footer />
		</div>
	);
}
