import { Shirt, Sparkles, Wind } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
	{
		icon: Wind,
		title: 'Giặt ủi',
		description:
			'Dịch vụ giặt ủi hoàn chỉnh với quy trình chuẩn. Quần áo sạch sẽ, thơm tho và được ủi phẳng phiu.',
		price: 'Từ 15,000đ/kg',
		features: ['Giặt bằng máy', 'Ủi chuyên nghiệp', 'Hương thơm tự nhiên'],
	},
	{
		icon: Shirt,
		title: 'Ủi quần áo',
		description:
			'Chuyên ủi các loại quần áo công sở, đầm dạ hội và trang phục quan trọng. Đảm bảo phẳng phiu, không nhăn.',
		price: 'Từ 10,000đ/chiếc',
		features: ['Ủi thủ công', 'Bảo quản form dáng', 'Giao hàng cẩn thận'],
	},
	{
		icon: Sparkles,
		title: 'Giặt khô',
		description:
			'Giặt khô chuyên nghiệp cho các loại vải cao cấp, đồ da, áo khoác và trang phục đặc biệt.',
		price: 'Từ 50,000đ/chiếc',
		features: ['Hóa chất chuyên dụng', 'Bảo vệ chất liệu', 'Xử lý vết bẩn'],
	},
];

export default function Services() {
	return (
		<section id="services" className="bg-muted/30 py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Dịch vụ của chúng tôi
					</h2>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						Lựa chọn dịch vụ phù hợp với nhu cầu của bạn
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
										Đặt dịch vụ
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Additional Info */}
				<div className="mx-auto mt-12 max-w-3xl text-center">
					<p className="text-sm text-muted-foreground">
						💡 <strong>Mẹo:</strong> Đặt combo nhiều dịch vụ để được giảm giá
						đến 20%. Liên hệ hotline để biết thêm chi tiết.
					</p>
					<div className="mt-6">
						<Button size="lg">Xem bảng giá chi tiết</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
