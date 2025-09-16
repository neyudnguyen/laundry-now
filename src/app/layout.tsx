import type { Metadata } from 'next';

import '@/app/globals.css';

export const metadata: Metadata = {
	title: 'Laundry Now',
	description: 'Your one-stop solution for laundry services',
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html lang="en">
			<body className="antialiased">{children}</body>
		</html>
	);
};

export default RootLayout;
