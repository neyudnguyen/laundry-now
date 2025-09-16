import { MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function Hero() {
	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
			<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-2 lg:py-24">
					{/* Left Content */}
					<div className="flex flex-col justify-center">
						<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							<span className="block">Dịch vụ</span>
							<span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Giặt Ủi Thông Minh
							</span>
						</h1>
						<p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
							Nhanh chóng – Tiện lợi – Tiết kiệm thời gian. Đặt giặt ủi chỉ với
							vài bước đơn giản.
						</p>

						{/* Location Selector and CTA */}
						<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
							<div className="flex-1">
								<label
									htmlFor="location-select"
									className="mb-2 block text-sm font-medium text-foreground"
								>
									Chọn địa điểm
								</label>
								<Select>
									<SelectTrigger id="location-select" className="h-12 w-full">
										<MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
										<SelectValue placeholder="Chọn quận/huyện" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="district1">Quận 1</SelectItem>
										<SelectItem value="district3">Quận 3</SelectItem>
										<SelectItem value="district7">Quận 7</SelectItem>
										<SelectItem value="district9">Quận 9</SelectItem>
										<SelectItem value="binh-thanh">Bình Thạnh</SelectItem>
										<SelectItem value="phu-nhuan">Phú Nhuận</SelectItem>
										<SelectItem value="tan-binh">Tân Bình</SelectItem>
										<SelectItem value="go-vap">Gò Vấp</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button size="lg" className="h-12 px-8 text-base">
								Bắt đầu ngay
							</Button>
						</div>

						{/* Trust Indicators */}
						<div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span>Giao nhận tận nơi</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-blue-500" />
								<span>Thanh toán linh hoạt</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-purple-500" />
								<span>Hỗ trợ 24/7</span>
							</div>
						</div>
					</div>

					{/* Right Image */}
					<div className="flex items-center justify-center">
						<Card className="w-full max-w-md overflow-hidden">
							<CardContent className="p-0">
								<div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
									<div className="text-center">
										<div className="text-4xl mb-4">🧺</div>
										<h3 className="text-xl font-semibold text-foreground mb-2">
											Dịch vụ chuyên nghiệp
										</h3>
										<p className="text-sm text-muted-foreground px-4">
											Máy móc hiện đại và quy trình chuẩn quốc tế
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
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
