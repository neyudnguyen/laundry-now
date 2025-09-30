import { ArrowRight, CheckCircle, Clock, Shield, Star } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
	return (
		<section id="about" className="py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
					{/* Left Content */}
					<div className="flex flex-col justify-center">
						<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							Nền tảng kết nối{' '}
							<span className="text-primary">Giặt ủi hàng đầu</span>
						</h2>
						<p className="mt-6 text-lg leading-8 text-muted-foreground">
							Giặt ủi nhanh là nền tảng kết nối khách hàng với mạng lưới các cửa
							hàng giặt ủi uy tín. Chúng tôi tạo ra một thị trường minh bạch,
							giúp bạn dễ dàng tìm kiếm, so sánh và lựa chọn dịch vụ tốt nhất.
						</p>

						{/* Features List */}
						<div className="mt-8 space-y-4">
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									Mạng lưới cửa hàng được kiểm duyệt kỹ lưỡng
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									Đánh giá và phản hồi thật từ khách hàng
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									So sánh giá cả và dịch vụ dễ dàng
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									Đặt hàng và thanh toán an toàn
								</span>
							</div>
						</div>

						<div className="mt-8">
							<Link href="/login">
								<Button size="lg" className="group">
									Khám phá cửa hàng
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link>
						</div>
					</div>

					{/* Right Content - Supporting Images Grid */}
					<div className="grid grid-cols-2 gap-4">
						{/* Card 1 */}
						<Card className="h-40">
							<CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
								<Clock className="h-8 w-8 text-primary mb-3" />
								<h4 className="font-semibold text-foreground">Đa dạng</h4>
							</CardContent>
						</Card>

						{/* Card 2 */}
						<Card className="h-40">
							<CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
								<Shield className="h-8 w-8 text-primary mb-3" />
								<h4 className="font-semibold text-foreground">Uy tín</h4>
							</CardContent>
						</Card>

						{/* Card 3 - Spans 2 columns */}
						<Card className="col-span-2 h-32">
							<CardContent className="flex h-full items-center justify-between p-6">
								<div>
									<h4 className="text-lg font-semibold text-foreground">
										Đánh giá 5 sao
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Từ hàng nghìn khách hàng tin tưởng
									</p>
								</div>
								<div className="flex">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className="h-5 w-5 fill-yellow-400 text-yellow-400"
										/>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Card 4 - Stats */}
						<Card className="col-span-2 h-24">
							<CardContent className="flex h-full items-center justify-around p-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">100+</div>
									<div className="text-xs text-muted-foreground">Cửa hàng</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">5K+</div>
									<div className="text-xs text-muted-foreground">Đơn hàng</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">4.8★</div>
									<div className="text-xs text-muted-foreground">Đánh giá</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}
