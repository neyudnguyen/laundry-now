import { Shirt, Sparkles, Wind } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
	{
		icon: Wind,
		title: 'Giặt ủi cơ bản',
		description:
			'Dịch vụ giặt ủi phổ biến nhất, phù hợp cho quần áo hàng ngày. Nhiều cửa hàng cung cấp với giá cạnh tranh.',
		price: 'Từ 12,000đ/kg',
		features: ['Giá cả hợp lý', 'Nhiều lựa chọn', 'Chất lượng đảm bảo'],
	},
	{
		icon: Shirt,
		title: 'Ủi chuyên nghiệp',
		description:
			'Các cửa hàng chuyên về ủi quần áo công sở, đồng phục với kỹ thuật cao và thiết bị hiện đại.',
		price: 'Từ 8,000đ/chiếc',
		features: ['Kỹ thuật cao', 'Trang thiết bị tốt', 'Thời gian nhanh'],
	},
	{
		icon: Sparkles,
		title: 'Giặt khô cao cấp',
		description:
			'Mạng lưới cửa hàng chuyên xử lý đồ cao cấp, vải đặc biệt với công nghệ và hóa chất chuyên dụng.',
		price: 'Từ 40,000đ/chiếc',
		features: [
			'Công nghệ tiên tiến',
			'Chuyên gia kinh nghiệm',
			'Bảo hành chất lượng',
		],
	},
];

export default function Services() {
	return (
		<section id="services" className="bg-muted/30 py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Dịch vụ đa dạng từ đối tác
					</h2>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						Khám phá các dịch vụ giặt ủi phong phú từ mạng lưới cửa hàng đối tác
						của chúng tôi
					</p>
				</div>

				{/* Services Grid */}
				<div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{services.map((service, index) => {
						const Icon = service.icon;
						return (
							<Card
								key={index}
								className="relative overflow-hidden transition-shadow hover:shadow-lg"
							>
								<CardHeader className="pb-4">
									<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
										<Icon className="h-8 w-8 text-primary" />
									</div>
									<CardTitle className="text-center text-xl">
										{service.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-center text-muted-foreground">
										{service.description}
									</p>

									<div className="text-center">
										<span className="text-lg font-semibold text-primary">
											{service.price}
										</span>
									</div>

									<ul className="space-y-2">
										{service.features.map((feature, idx) => (
											<li
												key={idx}
												className="flex items-center text-sm text-muted-foreground"
											>
												<div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
												{feature}
											</li>
										))}
									</ul>

									<Button className="w-full" variant="outline">
										Tìm cửa hàng
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Additional Info */}
				<div className="mx-auto mt-12 max-w-3xl text-center">
					<p className="text-sm text-muted-foreground">
						💡 <strong>Lưu ý:</strong> Giá cả có thể khác nhau tùy theo từng cửa
						hàng. Sử dụng nền tảng của chúng tôi để so sánh và tìm ưu đãi tốt
						nhất.
					</p>
					<div className="mt-6">
						<Button size="lg">Khám phá tất cả cửa hàng</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
