import { ArrowRight, CheckCircle, Clock, Shield, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
	return (
		<section className="py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
					{/* Left Content */}
					<div className="flex flex-col justify-center">
						<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							Chào mừng đến với{' '}
							<span className="text-primary">Laundry Now</span>
						</h2>
						<p className="mt-6 text-lg leading-8 text-muted-foreground">
							Chúng tôi mang đến trải nghiệm giặt ủi nhanh chóng, chất lượng và
							tiện lợi cho bạn. Với đội ngũ chuyên nghiệp và công nghệ hiện đại,
							Laundry Now cam kết bảo vệ quần áo của bạn như chính quần áo của
							chúng tôi.
						</p>

						{/* Features List */}
						<div className="mt-8 space-y-4">
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									Giặt sạch 99.9% vi khuẩn và bụi bẩn
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									Bảo vệ chất liệu vải và màu sắc tối ưu
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									Giao nhận đúng hẹn 100%
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground">
									Hỗ trợ khách hàng 24/7
								</span>
							</div>
						</div>

						<div className="mt-8">
							<Button size="lg" className="group">
								Tìm hiểu thêm
								<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</div>
					</div>

					{/* Right Content - Supporting Images Grid */}
					<div className="grid grid-cols-2 gap-4">
						{/* Card 1 */}
						<Card className="h-40">
							<CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
								<Clock className="h-8 w-8 text-primary mb-3" />
								<h4 className="font-semibold text-foreground">Nhanh chóng</h4>
								<p className="text-sm text-muted-foreground mt-1">
									Hoàn thành trong 24h
								</p>
							</CardContent>
						</Card>

						{/* Card 2 */}
						<Card className="h-40">
							<CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
								<Shield className="h-8 w-8 text-accent mb-3" />
								<h4 className="font-semibold text-foreground">An toàn</h4>
								<p className="text-sm text-muted-foreground mt-1">
									Hóa chất thân thiện
								</p>
							</CardContent>
						</Card>

						{/* Card 3 - Spans 2 columns */}
						<Card className="col-span-2 h-32">
							<CardContent className="flex h-full items-center justify-between p-6">
								<div>
									<h4 className="text-lg font-semibold text-foreground">
										Chất lượng 5 sao
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Được tin tưởng bởi hơn 10,000+ khách hàng
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
									<div className="text-2xl font-bold text-primary">10K+</div>
									<div className="text-xs text-muted-foreground">
										Khách hàng
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">50K+</div>
									<div className="text-xs text-muted-foreground">Đơn hàng</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">99%</div>
									<div className="text-xs text-muted-foreground">Hài lòng</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}
