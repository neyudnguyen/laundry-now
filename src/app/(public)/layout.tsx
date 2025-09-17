import Footer from '@/components/public/Footer';
import Header from '@/components/public/Header';

const PublicLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<div className="min-h-screen">
			<Header />
			<main>{children}</main>
			<Footer />
		</div>
	);
};

export default PublicLayout;
