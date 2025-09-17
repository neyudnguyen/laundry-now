import About from '@/components/public/About';
import Hero from '@/components/public/Hero';
import MapSection from '@/components/public/MapSection';
import Services from '@/components/public/Services';
import Testimonials from '@/components/public/Testimonials';

export default function HomePage() {
	return (
		<>
			<Hero />
			<About />
			<Services />
			<Testimonials />
			<MapSection />
		</>
	);
}
