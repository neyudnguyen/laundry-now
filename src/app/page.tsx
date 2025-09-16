import About from '@/components/About';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MapSection from '@/components/MapSection';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';

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
