import { Calendar, CheckCircle, Shield, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="pb-20 pt-16 text-center lg:pb-32 lg:pt-32">
						<div className="mx-auto max-w-4xl">
							<Badge variant="secondary" className="mb-4">
								Dịch vụ mới
							</Badge>
							<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
								<span className="block">Dịch vụ</span>
								<span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
									Giặt Ủi Thông Minh
								</span>
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
								Nhanh chóng – Tiện lợi – Tiết kiệm thời gian. Đặt giặt ủi chỉ
								với vài bước đơn giản.
							</p>
							<div className="mt-10 flex items-center justify-center gap-x-6">
								<Button size="lg" className="px-8 py-3 text-base">
									Đăng nhập
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="px-8 py-3 text-base"
								>
									Đăng ký
								</Button>
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

			{/* Features Section */}
			<section className="py-16 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							Tại sao chọn chúng tôi?
						</h2>
						<p className="mt-4 text-lg leading-8 text-muted-foreground">
							Trải nghiệm dịch vụ giặt ủi hiện đại với công nghệ tiên tiến
						</p>
					</div>

					<div className="mx-auto mt-16 max-w-5xl">
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
							{/* Feature 1 */}
							<Card className="text-center">
								<CardHeader>
									<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
										<Calendar className="h-8 w-8 text-primary" />
									</div>
									<CardTitle className="mt-4">Đặt lịch dễ dàng</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										Đặt lịch giặt ủi chỉ với vài thao tác đơn giản trên ứng
										dụng. Linh hoạt thời gian theo nhu cầu của bạn.
									</p>
								</CardContent>
							</Card>

							{/* Feature 2 */}
							<Card className="text-center">
								<CardHeader>
									<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
										<Truck className="h-8 w-8 text-accent-foreground" />
									</div>
									<CardTitle className="mt-4">Giao nhận tận nơi</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										Đội ngũ giao nhận chuyên nghiệp sẽ đến tận nhà để lấy và trả
										quần áo cho bạn một cách nhanh chóng.
									</p>
								</CardContent>
							</Card>

							{/* Feature 3 */}
							<Card className="text-center">
								<CardHeader>
									<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
										<Shield className="h-8 w-8 text-secondary-foreground" />
									</div>
									<CardTitle className="mt-4">Thanh toán an toàn</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										Hệ thống thanh toán trực tuyến bảo mật cao với nhiều phương
										thức thanh toán tiện lợi.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Additional Benefits Section */}
			<section className="bg-muted/30 py-16 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
						<div className="flex flex-col justify-center">
							<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
								Dịch vụ chuyên nghiệp
							</h2>
							<p className="mt-4 text-lg text-muted-foreground">
								Với đội ngũ có nhiều năm kinh nghiệm và công nghệ hiện đại,
								chúng tôi cam kết mang đến cho bạn chất lượng dịch vụ tốt nhất.
							</p>
							<div className="mt-8 space-y-4">
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-primary" />
									<p className="text-muted-foreground">
										Giặt sạch 99.9% vi khuẩn và bụi bẩn
									</p>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-primary" />
									<p className="text-muted-foreground">
										Bảo vệ chất liệu vải và màu sắc tối ưu
									</p>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-primary" />
									<p className="text-muted-foreground">
										Giao hàng đúng hẹn 100%
									</p>
								</div>
							</div>
						</div>
						<div className="relative">
							<Card className="h-full">
								<CardContent className="flex h-full items-center justify-center p-8">
									<div className="text-center">
										<div className="text-4xl font-bold text-primary">24/7</div>
										<div className="mt-2 text-lg font-semibold text-foreground">
											Hỗ trợ khách hàng
										</div>
										<div className="mt-4 text-sm text-muted-foreground">
											Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi
											lúc, mọi nơi
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<Card className="relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
						<CardContent className="relative px-6 py-16 text-center sm:px-16">
							<h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
								Bắt đầu ngay hôm nay
							</h2>
							<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">
								Trải nghiệm dịch vụ giặt ủi thông minh, tiện lợi và chất lượng
								cao. Đăng ký ngay để nhận ưu đãi đặc biệt!
							</p>
							<div className="mt-10 flex items-center justify-center gap-x-6">
								<Button
									variant="secondary"
									size="lg"
									className="px-8 py-3 text-base"
								>
									Đăng ký ngay
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="border-primary-foreground/20 bg-transparent px-8 py-3 text-base text-primary-foreground hover:bg-primary-foreground hover:text-primary"
								>
									Tìm hiểu thêm
								</Button>
							</div>
							<div
								className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
								aria-hidden="true"
							>
								<div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-foreground/20 to-accent-foreground/20 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t bg-background">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							© {new Date().getFullYear()} Laundry Now. Tất cả quyền được bảo
							lưu.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
