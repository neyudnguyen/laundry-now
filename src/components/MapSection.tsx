import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function MapSection() {
	return (
		<section className="bg-muted/30 py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Liên hệ & Địa chỉ
					</h2>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
					</p>
				</div>

				<div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Map Card */}
					<Card className="h-full">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Vị trí của chúng tôi
							</CardTitle>
						</CardHeader>
						<CardContent>
							{/* Map Placeholder */}
							<div className="aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
								<div className="flex h-full items-center justify-center">
									<div className="text-center">
										<MapPin className="mx-auto h-12 w-12 text-primary/60 mb-4" />
										<p className="text-muted-foreground">Bản đồ Google Maps</p>
										<p className="text-sm text-muted-foreground mt-1">
											Nhấn để xem chi tiết
										</p>
									</div>
								</div>
							</div>

							{/* Address */}
							<div className="mt-4 space-y-2">
								<h4 className="font-semibold text-foreground">
									Trung tâm chính
								</h4>
								<p className="text-sm text-muted-foreground">
									123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Contact Info Card */}
					<Card className="h-full">
						<CardHeader>
							<CardTitle>Thông tin liên hệ</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Phone */}
							<div className="flex items-start gap-3">
								<Phone className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<h4 className="font-semibold text-foreground">Hotline</h4>
									<p className="text-muted-foreground">1900 1234</p>
									<p className="text-sm text-muted-foreground">
										Miễn phí từ 6:00 - 22:00
									</p>
								</div>
							</div>

							<Separator />

							{/* Email */}
							<div className="flex items-start gap-3">
								<Mail className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<h4 className="font-semibold text-foreground">Email</h4>
									<p className="text-muted-foreground">
										support@Laundry Now.vn
									</p>
									<p className="text-sm text-muted-foreground">
										Phản hồi trong 24h
									</p>
								</div>
							</div>

							<Separator />

							{/* Hours */}
							<div className="flex items-start gap-3">
								<Clock className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<h4 className="font-semibold text-foreground">
										Giờ hoạt động
									</h4>
									<div className="space-y-1 text-sm text-muted-foreground">
										<p>Thứ 2 - Thứ 6: 6:00 - 22:00</p>
										<p>Thứ 7 - Chủ nhật: 7:00 - 21:00</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Locations */}
							<div>
								<h4 className="font-semibold text-foreground mb-3">
									Các chi nhánh khác
								</h4>
								<div className="space-y-2 text-sm text-muted-foreground">
									<p>📍 CN Quận 1: 456 Đường Lê Lợi, Quận 1</p>
									<p>📍 CN Quận 3: 789 Đường Cách Mạng Tháng 8, Quận 3</p>
									<p>📍 CN Bình Thạnh: 321 Đường Xô Viết Nghệ Tĩnh</p>
								</div>
							</div>

							{/* CTA Buttons */}
							<div className="space-y-3 pt-4">
								<Button className="w-full">Gọi ngay</Button>
								<Button variant="outline" className="w-full">
									Gửi tin nhắn
								</Button>
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
										Giao nhận miễn phí
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Trong bán kính 5km từ trung tâm
									</p>
								</div>
								<div className="text-center">
									<h4 className="font-semibold text-foreground">
										Thanh toán linh hoạt
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Tiền mặt, chuyển khoản, ví điện tử
									</p>
								</div>
								<div className="text-center">
									<h4 className="font-semibold text-foreground">
										Bảo hành chất lượng
									</h4>
									<p className="text-sm text-muted-foreground mt-1">
										Giặt lại miễn phí nếu không hài lòng
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
