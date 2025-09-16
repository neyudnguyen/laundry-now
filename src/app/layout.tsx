import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google';

import '@/app/globals.css';

const notoSans = Noto_Sans({
	variable: '--font-noto-sans',
	subsets: ['latin'],
});

const notoMono = Noto_Sans_Mono({
	variable: '--font-noto-mono',
	subsets: ['latin'],
});

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
			<body className={`${notoSans.variable} ${notoMono.variable} antialiased`}>
				{children}
			</body>
		</html>
	);
};

export default RootLayout;
