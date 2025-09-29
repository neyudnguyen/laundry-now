import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function MapSection() {
	return (
		<section id="contact" className="bg-muted/30 py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Khu vực phục vụ
					</h2>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						Mạng lưới cửa hàng đối tác phủ sóng toàn thành phố
					</p>
				</div>

				<div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Map Card */}
					<Card className="h-full">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Phạm vi hoạt động
							</CardTitle>
						</CardHeader>
						<CardContent>
							{/* Map Placeholder */}
							<div className="aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
								<div className="flex h-full items-center justify-center">
									<div className="text-center">
										<MapPin className="mx-auto h-12 w-12 text-primary/60 mb-4" />
										<p className="text-muted-foreground">
											Bản đồ cửa hàng đối tác
										</p>
										<p className="text-sm text-muted-foreground mt-1">
											Nhấn để xem chi tiết
										</p>
									</div>
								</div>
							</div>

							{/* Address */}
							<div className="mt-4 space-y-2">
								<h4 className="font-semibold text-foreground">
									Khu vực trung tâm TP.HCM
								</h4>
								<p className="text-sm text-muted-foreground">
									Quận 1, 3, 5, 7, 10, Tân Bình, Bình Thạnh và nhiều khu vực
									khác
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Contact Info Card */}
					<Card className="h-full">
						<CardHeader>
							<CardTitle>Hỗ trợ khách hàng</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Phone */}
							<div className="flex items-start gap-3">
								<Phone className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<h4 className="font-semibold text-foreground">
										Hotline hỗ trợ
									</h4>
									<p className="text-muted-foreground">1900 1234</p>
									<p className="text-sm text-muted-foreground">
										Hỗ trợ đặt hàng và giải đáp thắc mắc
									</p>
								</div>
							</div>

							<Separator />

							{/* Email */}
							<div className="flex items-start gap-3">
								<Mail className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<h4 className="font-semibold text-foreground">Email</h4>
									<p className="text-muted-foreground">support@laundrynow.vn</p>
									<p className="text-sm text-muted-foreground">
										Phản hồi khiếu nại và góp ý
									</p>
								</div>
							</div>

							<Separator />

							{/* Hours */}
							<div className="flex items-start gap-3">
								<Clock className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<h4 className="font-semibold text-foreground">
										Thời gian hỗ trợ
									</h4>
									<div className="space-y-1 text-sm text-muted-foreground">
										<p>Thứ 2 - Chủ nhật: 6:00 - 22:00</p>
										<p>Hỗ trợ trực tuyến 24/7</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Quick Actions */}
							<div className="space-y-3">
								<h4 className="font-semibold text-foreground">
									Hành động nhanh
								</h4>
								<div className="space-y-2">
									<Button className="w-full" variant="outline">
										Tìm cửa hàng gần nhất
									</Button>
									<Button className="w-full" variant="outline">
										Đăng ký làm đối tác
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Additional Info */}
				<div className="mx-auto mt-12 max-w-4xl">
					<Card>
						<CardContent className="p-6">
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
								<div className="text-center">
									<h4 className="font-semibold text-foreground">
										Đa dạng lựa chọn
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Hơn 100+ cửa hàng với dịch vụ khác nhau
									</p>
								</div>
								<div className="text-center">
									<h4 className="font-semibold text-foreground">
										So sánh giá cả
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Tìm ưu đãi tốt nhất cho nhu cầu của bạn
									</p>
								</div>
								<div className="text-center">
									<h4 className="font-semibold text-foreground">
										Đánh giá thật
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Phản hồi chân thực từ khách hàng khác
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
