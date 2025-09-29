import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Hero() {
	return (
		<section id="hero" className="relative overflow-hidden">
			<div
				className="absolute inset-0 -z-10 bg-cover bg-right"
				style={{
					backgroundImage: "url('/images/hero-banner.jpg')",
				}}
			/>
			<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-2 lg:py-24">
					{/* Left Content */}
					<div className="flex flex-col justify-center">
						{/* Text box với nền mờ */}
						<div
							className="rounded-lg p-8 max-w-xl shadow-lg"
							style={{
								backgroundColor: 'oklch(0.3034 0.0624 282.03 / 0.85)',
							}}
						>
							<h1 className="text-4xl font-bold tracking-tight text-white">
								<span className="block">Kết nối</span>
								<span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
									Giặt ủi thông minh
								</span>
							</h1>
							<p className="mt-6 text-lg leading-8 text-gray-200 sm:text-xl">
								Nền tảng kết nối khách hàng với các cửa hàng giặt ủi uy tín. Tìm
								kiếm, so sánh và đặt dịch vụ dễ dàng.
							</p>

							{/* CTA */}
							<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
								<Link href="/login">
									<Button size="lg" className="h-12 px-8 text-base">
										Tìm cửa hàng
									</Button>
								</Link>
							</div>

							{/* Trust Indicators */}
							<div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-300">
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-green-500" />
									<span>Nhiều cửa hàng lựa chọn</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-blue-500" />
									<span>So sánh giá dễ dàng</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-purple-500" />
									<span>Đánh giá thật từ khách hàng</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Decorative elements */}
			<div
				className="absolute -top-24 right-0 -z-10 transform-gpu overflow-hidden blur-3xl"
				aria-hidden="true"
			>
				<div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary/20 to-accent/20 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
			</div>
		</section>
	);
}
