import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google';

import '@/app/globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const notoSans = Noto_Sans({
	variable: '--font-noto-sans',
	subsets: ['latin'],
});

const notoMono = Noto_Sans_Mono({
	variable: '--font-noto-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Giặt ủi nhanh',
	description: 'Nền tảng giặt ủi nhanh cho người bận rộn',
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html lang="en">
			<body className={`${notoSans.variable} ${notoMono.variable} antialiased`}>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
