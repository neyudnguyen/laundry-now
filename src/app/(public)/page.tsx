'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import About from '@/components/public/About';
import Hero from '@/components/public/Hero';
import MapSection from '@/components/public/MapSection';
import Services from '@/components/public/Services';
import Testimonials from '@/components/public/Testimonials';

export default function HomePage() {
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session?.user) {
			// User is logged in, redirect to appropriate dashboard
			if (session.user.role === 'CUSTOMER') {
				router.push('/customer/marketplace');
			} else if (session.user.role === 'VENDOR') {
				router.push('/vendor/dashboard');
			}
		}
	}, [session, router]);

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
