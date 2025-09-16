import { Quote, Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
	{
		name: 'Nguyễn Thị Mai',
		role: 'Nhân viên văn phòng',
		avatar: '',
		rating: 5,
		content:
			'Dịch vụ tuyệt vời! Quần áo được giặt sạch sẽ và thơm tho. Đội ngũ giao nhận rất chuyên nghiệp và đúng giờ. Tôi rất hài lòng.',
	},
	{
		name: 'Trần Minh Hoàng',
		role: 'Kinh doanh',
		avatar: '',
		rating: 5,
		content:
			'Laundry Now đã giúp tôi tiết kiệm rất nhiều thời gian. Chất lượng giặt ủi xuất sắc, giá cả hợp lý. Chắc chắn sẽ tiếp tục sử dụng.',
	},
	{
		name: 'Lê Thị Hương',
		role: 'Mẹ bỉm sữa',
		avatar: '',
		rating: 5,
		content:
			'Với hai con nhỏ, tôi không có thời gian giặt giũ. Laundry Now đã cứu rỗi cuộc sống của tôi. Dịch vụ nhanh, sạch và an toàn cho trẻ em.',
	},
	{
		name: 'Phạm Văn Đức',
		role: 'Sinh viên',
		avatar: '',
		rating: 4,
		content:
			'Dịch vụ tốt, giá cả phù hợp với sinh viên. Ứng dụng đặt hàng dễ sử dụng. Chỉ mong có thêm nhiều ưu đãi cho học sinh, sinh viên.',
	},
	{
		name: 'Võ Thị Lan',
		role: 'Quản lý khách sạn',
		avatar: '',
		rating: 5,
		content:
			'Chúng tôi đã hợp tác với Laundry Now để giặt đồ khách sạn. Chất lượng ổn định, giao hàng đúng hẹn. Đối tác đáng tin cậy.',
	},
	{
		name: 'Ngô Minh Tuấn',
		role: 'Bác sĩ',
		avatar: '',
		rating: 5,
		content:
			'Áo blouse trắng của tôi luôn được giặt sạch sẽ và trắng tinh. Dịch vụ chuyên nghiệp, đáng tin cậy. Rất khuyến khích mọi người dùng thử.',
	},
];

function StarRating({ rating }: { rating: number }) {
	return (
		<div className="flex">
			{[...Array(5)].map((_, i) => (
				<Star
					key={i}
					className={`h-4 w-4 ${
						i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
					}`}
				/>
			))}
		</div>
	);
}

export default function Testimonials() {
	return (
		<section className="py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Khách hàng nói gì về chúng tôi
					</h2>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						Hơn 10,000+ khách hàng tin tưởng và sử dụng dịch vụ của Laundry Now
					</p>
				</div>

				{/* Testimonials Grid */}
				<div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{testimonials.map((testimonial, index) => (
						<Card key={index} className="relative">
							<CardContent className="p-6">
								{/* Quote Icon */}
								<Quote className="h-8 w-8 text-primary/20 mb-4" />

								{/* Rating */}
								<StarRating rating={testimonial.rating} />

								{/* Review Content */}
								<p className="mt-4 text-muted-foreground leading-relaxed">
									&ldquo;{testimonial.content}&rdquo;
								</p>

								{/* Customer Info */}
								<div className="mt-6 flex items-center gap-3">
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={testimonial.avatar}
											alt={testimonial.name}
										/>
										<AvatarFallback className="bg-primary/10 text-primary">
											{testimonial.name
												.split(' ')
												.map((n) => n[0])
												.join('')}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-semibold text-foreground">
											{testimonial.name}
										</div>
										<div className="text-sm text-muted-foreground">
											{testimonial.role}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Bottom CTA */}
				<div className="mx-auto mt-16 max-w-2xl text-center">
					<p className="text-muted-foreground">
						Trải nghiệm dịch vụ tuyệt vời như những khách hàng trên
					</p>
					<div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
						<div className="text-sm text-muted-foreground">
							⭐ 4.9/5 điểm từ 2,500+ đánh giá
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
